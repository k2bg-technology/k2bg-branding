import type { WarehouseQueryParams } from '../../../../../../infrastructure/warehouse';
import { type GroupedValuesPlan, Reduction } from '../../../../domain';
import {
  CATEGORY_ALIAS,
  SORT_KEY_ALIAS,
  SORT_KEY_DISTINCT_COUNT_ALIAS,
  valueColumnAlias,
} from './aliases';
import { qualifiedView, quoteIdentifier } from './identifier';
import {
  type BuiltQuery,
  buildSourceFilters,
  calendarDateExpression,
  PERIOD_END_PARAMETER,
  PERIOD_START_PARAMETER,
  periodKeyExpression,
  sourceTimeExpression,
  TIME_ZONE_PARAMETER,
  validatedHourExpression,
  valueExpression,
} from './query';
import {
  aggregateNames,
  latestDistinctCountProjection,
  latestValueProjection,
} from './statTiles';

export function buildGroupedValuesQuery(plan: GroupedValuesPlan): BuiltQuery {
  if (plan.buckets === null && plan.category === null) {
    throw new Error('Grouped values require a period or category key');
  }
  const calendarDate = calendarDateExpression(plan.source.time);
  const validatedHour = validatedHourExpression(plan.source.time);
  const filters = buildSourceFilters(plan.source);
  const keys = [
    ...(plan.buckets === null ? [] : ['period']),
    ...(plan.category === null ? [] : [CATEGORY_ALIAS]),
  ];
  const hasLatest = plan.measures.some(
    (measure) => measure.reduction === Reduction.LATEST
  );
  const filteredSelections = [
    ...(plan.buckets === null
      ? []
      : [`${periodKeyExpression(plan.buckets.grain, calendarDate)} AS period`]),
    ...(plan.category === null
      ? []
      : [
          `CAST(${quoteIdentifier(plan.category.column)} AS STRING) AS ${CATEGORY_ALIAS}`,
        ]),
    ...(hasLatest
      ? [`${sourceTimeExpression(plan.source.time)} AS source_time`]
      : []),
    ...(plan.category?.sortKey === null || plan.category?.sortKey === undefined
      ? []
      : [
          `CAST(${quoteIdentifier(plan.category.sortKey.column)} AS ${plan.category.sortKey.type === 'text' ? 'STRING' : 'FLOAT64'}) AS ${SORT_KEY_ALIAS}`,
        ]),
    ...plan.measures.map(
      (measure, index) =>
        `${valueExpression(measure.column, measure.transform)} AS ${valueColumnAlias(index)}`
    ),
  ];
  const projections = plan.measures.flatMap((measure, index) => {
    const alias = valueColumnAlias(index);
    return measure.reduction === Reduction.LATEST
      ? [
          latestValueProjection(alias),
          latestDistinctCountProjection(alias, index),
        ]
      : [
          `CAST(${aggregateNames[measure.reduction]}(${alias}) AS FLOAT64) AS ${alias}`,
        ];
  });
  if (plan.category?.sortKey !== null && plan.category?.sortKey !== undefined) {
    projections.push(
      `MIN(${SORT_KEY_ALIAS}) AS ${SORT_KEY_ALIAS}`,
      `CAST(COUNT(DISTINCT TO_JSON_STRING(${SORT_KEY_ALIAS})) AS FLOAT64) AS ${SORT_KEY_DISTINCT_COUNT_ALIAS}`
    );
  }
  const sql = [
    'WITH filtered AS (',
    `SELECT ${filteredSelections.join(', ')}`,
    `FROM ${qualifiedView(plan.source.dataset, plan.source.view)}`,
    `WHERE ${calendarDate} >= CAST(@${PERIOD_START_PARAMETER} AS DATE)`,
    `AND ${calendarDate} <= CAST(@${PERIOD_END_PARAMETER} AS DATE)`,
    ...(validatedHour === null ? [] : [`AND ${validatedHour} IS NOT NULL`]),
    ...filters.clauses.map((clause) => `AND ${clause}`),
    ...(hasLatest || plan.buckets !== null ? [')' + ','] : [')']),
    ...(hasLatest
      ? [
          `keyed AS (SELECT *, MAX(source_time) OVER (PARTITION BY ${keys.join(', ')}) AS latest_time FROM filtered)${plan.buckets === null ? '' : ','}`,
        ]
      : []),
    ...(plan.buckets === null
      ? []
      : [
          'periods AS (SELECT DISTINCT period FROM filtered ORDER BY period DESC LIMIT @bucket_limit)',
        ]),
    `SELECT ${keys.join(', ')}, ${projections.join(',\n')}`,
    `FROM ${hasLatest ? 'keyed' : 'filtered'}${plan.buckets === null ? '' : ' JOIN periods USING (period)'}`,
    `GROUP BY ${keys.join(', ')}`,
    `ORDER BY ${keys.map((key) => (key === 'period' ? 'period DESC' : key)).join(', ')}`,
  ].join('\n');
  const params: WarehouseQueryParams = {
    [PERIOD_START_PARAMETER]: plan.dateRange.firstDate,
    [PERIOD_END_PARAMETER]: plan.dateRange.lastDate,
    [TIME_ZONE_PARAMETER]: plan.timeZone,
    ...filters.params,
    ...(plan.buckets === null
      ? {}
      : { bucket_limit: plan.buckets.bucketLimit + 1 }),
  };
  return { sql, params };
}
