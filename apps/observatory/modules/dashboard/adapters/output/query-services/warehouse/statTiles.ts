import type { WarehouseQueryParams } from '../../../../../../infrastructure/warehouse';
import { Reduction, type SectionQueryPlan } from '../../../../domain';
import { distinctCountAlias, valueColumnAlias } from './aliases';
import { qualifiedView, quoteIdentifier } from './identifier';
import {
  type BuiltQuery,
  buildSourceFilters,
  calendarDateExpression,
  PERIOD_END_PARAMETER,
  PERIOD_START_PARAMETER,
  periodKeyExpression,
  TIME_ZONE_PARAMETER,
  timeColumn,
} from './query';

const aggregateNames = {
  [Reduction.SUM]: 'SUM',
  [Reduction.AVERAGE]: 'AVG',
  [Reduction.MINIMUM]: 'MIN',
  [Reduction.MAXIMUM]: 'MAX',
} as const;

function latestValueProjection(alias: string): string {
  return [
    'CAST(',
    `ARRAY_AGG(STRUCT(source_time, ${alias}) ORDER BY source_time DESC LIMIT 1)[SAFE_OFFSET(0)].${alias}`,
    'AS FLOAT64)',
    `AS ${alias}`,
  ].join(' ');
}

function latestDistinctCountProjection(alias: string, index: number): string {
  return `CAST(COUNT(DISTINCT IF(source_time = latest_time, TO_JSON_STRING(${alias}), NULL)) AS FLOAT64) AS ${distinctCountAlias(index)}`;
}

export function buildGroupedSectionQuery(
  plan: SectionQueryPlan,
  order: 'ASC' | 'DESC',
  bucketLimit?: number
): BuiltQuery {
  const calendarDate = calendarDateExpression(plan.source.time);
  const pair =
    typeof plan.source.time !== 'string' && 'date' in plan.source.time
      ? plan.source.time
      : null;
  const validatedHour =
    pair === null
      ? null
      : `IF(${quoteIdentifier(pair.hour)} BETWEEN 0 AND 23, ${quoteIdentifier(pair.hour)}, ERROR('source.time.hour must be an integer from 0 through 23'))`;
  const sourceTime =
    pair === null
      ? quoteIdentifier(timeColumn(plan.source.time))
      : `DATETIME(${calendarDate}, TIME(${validatedHour}, 0, 0))`;
  const filters = buildSourceFilters(plan.source);
  const valueSelections = plan.measures.map((measure, index) => {
    const value = `CAST(${quoteIdentifier(measure.column)} AS FLOAT64)`;
    if (measure.transform === 'negate') {
      return `-(${value}) AS ${valueColumnAlias(index)}`;
    }
    if (measure.transform === 'absolute') {
      return `ABS(${value}) AS ${valueColumnAlias(index)}`;
    }
    return `${value} AS ${valueColumnAlias(index)}`;
  });
  const filteredSelections = [
    `${
      plan.grain === 'hour'
        ? `FORMAT('%sT%02d', FORMAT_DATE('%F', ${calendarDate}), ${validatedHour})`
        : periodKeyExpression(plan.grain, calendarDate)
    } AS period`,
    `${sourceTime} AS source_time`,
  ].concat(valueSelections);
  const projections = plan.measures.flatMap((measure, index) => {
    const alias = valueColumnAlias(index);
    if (measure.reduction === Reduction.LATEST) {
      return [
        latestValueProjection(alias),
        latestDistinctCountProjection(alias, index),
      ];
    }
    return [
      `CAST(${aggregateNames[measure.reduction]}(${alias}) AS FLOAT64) AS ${alias}`,
    ];
  });

  const sql = [
    'WITH filtered AS (',
    `SELECT ${filteredSelections.join(', ')}`,
    `FROM ${qualifiedView(plan.source.dataset, plan.source.view)}`,
    `WHERE ${calendarDate} >= CAST(@${PERIOD_START_PARAMETER} AS DATE)`,
    `AND ${calendarDate} <= CAST(@${PERIOD_END_PARAMETER} AS DATE)`,
    ...(validatedHour === null ? [] : [`AND ${validatedHour} IS NOT NULL`]),
    ...(plan.kind === 'time-series' && plan.grain === 'hour'
      ? [
          `AND (${calendarDate} > CAST(@${PERIOD_START_PARAMETER} AS DATE) OR ${validatedHour} >= @first_hour)`,
        ]
      : []),
    ...filters.clauses.map((clause) => `AND ${clause}`),
    '),',
    'bucket_times AS (SELECT period, MAX(source_time) AS latest_time FROM filtered GROUP BY period)',
    `SELECT filtered.period, ${projections.join(',\n')}`,
    'FROM filtered JOIN bucket_times USING (period)',
    'GROUP BY filtered.period',
    `ORDER BY filtered.period ${order === 'DESC' ? 'DESC' : ''}`.trimEnd(),
    ...(bucketLimit === undefined ? [] : ['LIMIT @bucket_limit']),
  ].join('\n');

  const params: WarehouseQueryParams = {
    [PERIOD_START_PARAMETER]: plan.dateRange.firstDate,
    [PERIOD_END_PARAMETER]: plan.dateRange.lastDate,
    [TIME_ZONE_PARAMETER]: plan.timeZone,
    ...(plan.kind === 'time-series' && plan.grain === 'hour'
      ? { first_hour: plan.firstHour }
      : {}),
    ...filters.params,
    ...(bucketLimit === undefined ? {} : { bucket_limit: bucketLimit + 1 }),
  };
  return { sql, params };
}

export function buildStatTilesQuery(
  plan: Extract<SectionQueryPlan, { kind: 'stat-tiles' }>
): BuiltQuery {
  return buildGroupedSectionQuery(plan, 'ASC');
}
