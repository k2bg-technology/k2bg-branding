import type { WarehouseQueryParams } from '../../../../../../infrastructure/warehouse';
import type { MatrixAxisPlan, MatrixQueryPlan } from '../../../../domain';
import {
  COLUMN_KEY_ALIAS,
  COLUMN_RANK_ALIAS,
  ROW_KEY_ALIAS,
  ROW_RANK_ALIAS,
  valueColumnAlias,
} from './aliases';
import { qualifiedView, quoteIdentifier } from './identifier';
import {
  type BuiltQuery,
  buildSourceFilters,
  calendarDateExpression,
  PERIOD_END_PARAMETER,
  PERIOD_START_PARAMETER,
  TIME_ZONE_PARAMETER,
  validatedHourExpression,
  valueExpression,
} from './query';
import { aggregateNames } from './statTiles';

export const CELL_LIMIT_PARAMETER = 'cell_limit';

function groupExpression(
  axis: MatrixAxisPlan,
  calendarDate: string,
  validatedHour: string | null
) {
  if (axis.axis !== 'category') {
    if (axis.axis === 'date') return `FORMAT_DATE('%F', ${calendarDate})`;
    if (validatedHour === null)
      throw new Error('An hour axis requires an hour binding');
    return `FORMAT('%02d', ${validatedHour})`;
  }
  return quoteIdentifier(axis.column);
}

function axisProjection(
  axis: MatrixAxisPlan,
  group: string,
  keyAlias: string,
  rankAlias: string
) {
  if (axis.axis !== 'category') return [`${group} AS ${keyAlias}`];
  return [
    `CAST(${group} AS STRING) AS ${keyAlias}`,
    `DENSE_RANK() OVER (ORDER BY ${group} IS NULL, ${group}) AS ${rankAlias}`,
  ];
}

function axisOrder(axis: MatrixAxisPlan, group: string) {
  return axis.axis === 'category' ? [`${group} IS NULL`, group] : [group];
}

export function buildMatrixQuery(plan: MatrixQueryPlan): BuiltQuery {
  const calendarDate = calendarDateExpression(plan.source.time);
  const validatedHour = validatedHourExpression(plan.source.time);
  const filters = buildSourceFilters(plan.source);
  const rowGroup = 'row_group';
  const columnGroup = 'column_group';
  const valueAlias = valueColumnAlias(0);
  const selections = [
    `${groupExpression(plan.rows, calendarDate, validatedHour)} AS ${rowGroup}`,
    `${groupExpression(plan.columns, calendarDate, validatedHour)} AS ${columnGroup}`,
    `${valueExpression(plan.measure.column, plan.measure.transform)} AS ${valueAlias}`,
  ];
  const projections = [
    ...axisProjection(plan.rows, rowGroup, ROW_KEY_ALIAS, ROW_RANK_ALIAS),
    ...axisProjection(
      plan.columns,
      columnGroup,
      COLUMN_KEY_ALIAS,
      COLUMN_RANK_ALIAS
    ),
    `CAST(${aggregateNames[plan.measure.reduction]}(${valueAlias}) AS FLOAT64) AS ${valueAlias}`,
  ];
  const sql = [
    'WITH filtered AS (',
    `SELECT ${selections.join(', ')}`,
    `FROM ${qualifiedView(plan.source.dataset, plan.source.view)}`,
    `WHERE ${calendarDate} >= CAST(@${PERIOD_START_PARAMETER} AS DATE)`,
    `AND ${calendarDate} <= CAST(@${PERIOD_END_PARAMETER} AS DATE)`,
    ...(validatedHour === null ? [] : [`AND ${validatedHour} IS NOT NULL`]),
    ...filters.clauses.map((clause) => `AND ${clause}`),
    ')',
    `SELECT ${projections.join(', ')}`,
    'FROM filtered',
    `GROUP BY ${rowGroup}, ${columnGroup}`,
    `ORDER BY ${[
      ...axisOrder(plan.rows, rowGroup),
      ...axisOrder(plan.columns, columnGroup),
    ].join(', ')}`,
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
