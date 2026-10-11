import type { TreemapQueryPlan } from '../../../../domain';
import { CATEGORY_ALIAS, GROUP_ALIAS, valueColumnAlias } from './aliases';
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

export function buildTreemapQuery(plan: TreemapQueryPlan): BuiltQuery {
  const calendarDate = calendarDateExpression(plan.source.time);
  const validatedHour = validatedHourExpression(plan.source.time);
  const filters = buildSourceFilters(plan.source);
  const keys = [...(plan.group === null ? [] : [GROUP_ALIAS]), CATEGORY_ALIAS];
  const filteredSelections = [
    ...(plan.group === null
      ? []
      : [`CAST(${quoteIdentifier(plan.group)} AS STRING) AS ${GROUP_ALIAS}`]),
    `CAST(${quoteIdentifier(plan.category)} AS STRING) AS ${CATEGORY_ALIAS}`,
    `${valueExpression(plan.measure.column, plan.measure.transform)} AS ${valueColumnAlias(0)}`,
  ];
  const sql = [
    'WITH filtered AS (',
    `SELECT ${filteredSelections.join(', ')}`,
    `FROM ${qualifiedView(plan.source.dataset, plan.source.view)}`,
    `WHERE ${calendarDate} >= CAST(@${PERIOD_START_PARAMETER} AS DATE)`,
    `AND ${calendarDate} <= CAST(@${PERIOD_END_PARAMETER} AS DATE)`,
    ...(validatedHour === null ? [] : [`AND ${validatedHour} IS NOT NULL`]),
    ...filters.clauses.map((clause) => `AND ${clause}`),
    ')',
    `SELECT ${keys.join(', ')}, CAST(SUM(${valueColumnAlias(0)}) AS FLOAT64) AS ${valueColumnAlias(0)}`,
    'FROM filtered',
    `GROUP BY ${keys.join(', ')}`,
    `ORDER BY ${keys.join(', ')}`,
  ].join('\n');
  return {
    sql,
    params: {
      [PERIOD_START_PARAMETER]: plan.dateRange.firstDate,
      [PERIOD_END_PARAMETER]: plan.dateRange.lastDate,
      [TIME_ZONE_PARAMETER]: plan.timeZone,
      ...filters.params,
    },
  };
}
