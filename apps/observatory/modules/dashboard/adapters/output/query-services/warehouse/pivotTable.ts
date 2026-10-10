import type { WarehouseQueryParams } from '../../../../../../infrastructure/warehouse';
import { type PivotQueryPlan, Reduction } from '../../../../domain';
import {
  CELL_LIMIT_PARAMETER,
  COLUMN_KEY_ALIAS,
  ROW_KEY_ALIAS,
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

export function buildPivotQuery(plan: PivotQueryPlan): BuiltQuery {
  const calendarDate = calendarDateExpression(plan.source.time);
  const validatedHour = validatedHourExpression(plan.source.time);
  const filters = buildSourceFilters(plan.source);
  const valueAlias = valueColumnAlias(0);
  const filteredSelections = [
    `CAST(${quoteIdentifier(plan.rowKey.column)} AS STRING) AS ${ROW_KEY_ALIAS}`,
    plan.columnKey.kind === 'period'
      ? `${periodKeyExpression(plan.columnKey.grain, calendarDate)} AS ${COLUMN_KEY_ALIAS}`
      : `CAST(${quoteIdentifier(plan.columnKey.column)} AS STRING) AS ${COLUMN_KEY_ALIAS}`,
    ...(plan.measure.reduction === Reduction.LATEST
      ? [`${sourceTimeExpression(plan.source.time)} AS source_time`]
      : []),
    ...(plan.rowKey.sortKey === null
      ? []
      : [
          `CAST(${quoteIdentifier(plan.rowKey.sortKey.column)} AS ${plan.rowKey.sortKey.type === 'text' ? 'STRING' : 'FLOAT64'}) AS ${SORT_KEY_ALIAS}`,
        ]),
    `${valueExpression(plan.measure.column, plan.measure.transform)} AS ${valueAlias}`,
  ];
  const projections = [
    ...(plan.measure.reduction === Reduction.LATEST
      ? [
          latestValueProjection(valueAlias),
          latestDistinctCountProjection(valueAlias, 0),
        ]
      : [
          `CAST(${aggregateNames[plan.measure.reduction]}(${valueAlias}) AS FLOAT64) AS ${valueAlias}`,
        ]),
    ...(plan.rowKey.sortKey === null
      ? []
      : [
          `MIN(${SORT_KEY_ALIAS}) AS ${SORT_KEY_ALIAS}`,
          `CAST(COUNT(DISTINCT TO_JSON_STRING(${SORT_KEY_ALIAS})) AS FLOAT64) AS ${SORT_KEY_DISTINCT_COUNT_ALIAS}`,
        ]),
  ];
  const hasLatest = plan.measure.reduction === Reduction.LATEST;
  const sql = [
    'WITH filtered AS (',
    `SELECT ${filteredSelections.join(', ')}`,
    `FROM ${qualifiedView(plan.source.dataset, plan.source.view)}`,
    `WHERE ${calendarDate} >= CAST(@${PERIOD_START_PARAMETER} AS DATE)`,
    `AND ${calendarDate} <= CAST(@${PERIOD_END_PARAMETER} AS DATE)`,
    ...(validatedHour === null ? [] : [`AND ${validatedHour} IS NOT NULL`]),
    ...filters.clauses.map((clause) => `AND ${clause}`),
    hasLatest ? '),' : ')',
    ...(hasLatest
      ? [
          `keyed AS (SELECT *, MAX(source_time) OVER (PARTITION BY ${ROW_KEY_ALIAS}, ${COLUMN_KEY_ALIAS}) AS latest_time FROM filtered)`,
        ]
      : []),
    `SELECT ${ROW_KEY_ALIAS}, ${COLUMN_KEY_ALIAS}, ${projections.join(',\n')}`,
    `FROM ${hasLatest ? 'keyed' : 'filtered'}`,
    `GROUP BY ${ROW_KEY_ALIAS}, ${COLUMN_KEY_ALIAS}`,
    `ORDER BY ${ROW_KEY_ALIAS}, ${COLUMN_KEY_ALIAS}`,
    `LIMIT @${CELL_LIMIT_PARAMETER}`,
  ].join('\n');
  const params: WarehouseQueryParams = {
    [PERIOD_START_PARAMETER]: plan.dateRange.firstDate,
    [PERIOD_END_PARAMETER]: plan.dateRange.lastDate,
    [TIME_ZONE_PARAMETER]: plan.timeZone,
    ...filters.params,
    [CELL_LIMIT_PARAMETER]: plan.cellLimit + 1,
  };
  return { sql, params };
}
