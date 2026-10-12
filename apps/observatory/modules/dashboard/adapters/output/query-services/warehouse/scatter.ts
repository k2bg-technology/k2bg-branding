import type { ScatterQueryPlan } from '../../../../domain';
import { SERIES_ALIAS, X_VALUE_ALIAS, Y_VALUE_ALIAS } from './aliases';
import { qualifiedView, quoteIdentifier } from './identifier';
import {
  type BuiltQuery,
  buildSourceFilters,
  calendarDateExpression,
  PERIOD_END_PARAMETER,
  PERIOD_START_PARAMETER,
  sourceTimeExpression,
  TIME_ZONE_PARAMETER,
  validatedHourExpression,
  valueExpression,
} from './query';

export function buildScatterQuery(plan: ScatterQueryPlan): BuiltQuery {
  const calendarDate = calendarDateExpression(plan.source.time);
  const validatedHour = validatedHourExpression(plan.source.time);
  const filters = buildSourceFilters(plan.source);
  const seriesProjection =
    plan.series === null
      ? []
      : [`CAST(${quoteIdentifier(plan.series)} AS STRING) AS ${SERIES_ALIAS}`];
  const aliases = [
    X_VALUE_ALIAS,
    Y_VALUE_ALIAS,
    ...(plan.series === null ? [] : [SERIES_ALIAS]),
  ];
  const order = [
    'source_time DESC NULLS LAST',
    `${X_VALUE_ALIAS} ASC`,
    `${Y_VALUE_ALIAS} ASC`,
    ...(plan.series === null ? [] : [`${SERIES_ALIAS} ASC NULLS LAST`]),
  ];
  const sql = [
    'WITH projected AS (',
    `SELECT ${[
      `${sourceTimeExpression(plan.source.time)} AS source_time`,
      `${valueExpression(plan.x)} AS ${X_VALUE_ALIAS}`,
      `${valueExpression(plan.y)} AS ${Y_VALUE_ALIAS}`,
      ...seriesProjection,
    ].join(', ')}`,
    `FROM ${qualifiedView(plan.source.dataset, plan.source.view)}`,
    `WHERE ${calendarDate} >= CAST(@${PERIOD_START_PARAMETER} AS DATE)`,
    `AND ${calendarDate} <= CAST(@${PERIOD_END_PARAMETER} AS DATE)`,
    ...(validatedHour === null ? [] : [`AND ${validatedHour} IS NOT NULL`]),
    ...filters.clauses.map((clause) => `AND ${clause}`),
    ')',
    `SELECT ${aliases.join(', ')}`,
    'FROM projected',
    `WHERE ${X_VALUE_ALIAS} IS NOT NULL AND ${Y_VALUE_ALIAS} IS NOT NULL`,
    `ORDER BY ${order.join(', ')}`,
    'LIMIT @row_limit',
  ].join('\n');
  return {
    sql,
    params: {
      [PERIOD_START_PARAMETER]: plan.dateRange.firstDate,
      [PERIOD_END_PARAMETER]: plan.dateRange.lastDate,
      [TIME_ZONE_PARAMETER]: plan.timeZone,
      ...filters.params,
      row_limit: plan.limit + 1,
    },
  };
}
