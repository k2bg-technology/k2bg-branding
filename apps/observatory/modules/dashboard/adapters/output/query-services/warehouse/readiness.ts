import type { ReadinessQueryPlan } from '../../../../domain';
import { NOT_READY_COUNT_ALIAS } from './aliases';
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
} from './query';

export function buildReadinessQuery(plan: ReadinessQueryPlan): BuiltQuery {
  const calendarDate = calendarDateExpression(plan.source.time);
  const validatedHour = validatedHourExpression(plan.source.time);
  const filters = buildSourceFilters(plan.source);
  return {
    sql: [
      'WITH filtered AS (',
      `SELECT ${quoteIdentifier(plan.column)} AS ready, ${sourceTimeExpression(plan.source.time)} AS source_time`,
      `FROM ${qualifiedView(plan.source.dataset, plan.source.view)}`,
      `WHERE ${calendarDate} >= CAST(@${PERIOD_START_PARAMETER} AS DATE)`,
      `AND ${calendarDate} <= CAST(@${PERIOD_END_PARAMETER} AS DATE)`,
      ...(validatedHour === null ? [] : [`AND ${validatedHour} IS NOT NULL`]),
      ...filters.clauses.map((clause) => `AND ${clause}`),
      ')',
      `SELECT CAST(COUNTIF(ready IS NOT TRUE) AS FLOAT64) AS ${NOT_READY_COUNT_ALIAS}`,
      'FROM filtered',
      'WHERE source_time = (SELECT MAX(source_time) FROM filtered)',
    ].join('\n'),
    params: {
      [PERIOD_START_PARAMETER]: plan.dateRange.firstDate,
      [PERIOD_END_PARAMETER]: plan.dateRange.lastDate,
      [TIME_ZONE_PARAMETER]: plan.timeZone,
      ...filters.params,
    },
  };
}
