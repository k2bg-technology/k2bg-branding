import type { WarehouseQueryParams } from '../../../../../../infrastructure/warehouse';
import { Reduction, type SectionQueryPlan } from '../../../../domain';
import { distinctCountAlias, valueColumnAlias } from './aliases';
import { qualifiedView, quoteIdentifier } from './identifier';
import {
  type BuiltQuery,
  calendarDateExpression,
  PERIOD_END_PARAMETER,
  PERIOD_START_PARAMETER,
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

export function buildStatTilesQuery(plan: SectionQueryPlan): BuiltQuery {
  const calendarDate = calendarDateExpression(plan.source.time);
  const sourceTime = quoteIdentifier(timeColumn(plan.source.time));
  const valueSelections = plan.measures.map(
    (measure, index) =>
      `CAST(${quoteIdentifier(measure.column)} AS FLOAT64) AS ${valueColumnAlias(index)}`
  );
  const filteredSelections = [
    `FORMAT_DATE('%Y-%m', ${calendarDate}) AS period`,
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
    '),',
    'bucket_times AS (SELECT period, MAX(source_time) AS latest_time FROM filtered GROUP BY period)',
    `SELECT filtered.period, ${projections.join(',\n')}`,
    'FROM filtered JOIN bucket_times USING (period)',
    'GROUP BY filtered.period',
    'ORDER BY filtered.period',
  ].join('\n');

  const params: WarehouseQueryParams = {
    [PERIOD_START_PARAMETER]: plan.dateRange.firstDate,
    [PERIOD_END_PARAMETER]: plan.dateRange.lastDate,
    [TIME_ZONE_PARAMETER]: plan.timeZone,
  };
  return { sql, params };
}
