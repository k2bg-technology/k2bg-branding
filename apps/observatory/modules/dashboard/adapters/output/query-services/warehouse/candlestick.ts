import type { SectionQueryPlan } from '../../../../domain';
import { distinctCountAlias, valueColumnAlias } from './aliases';
import { qualifiedView } from './identifier';
import {
  type BuiltQuery,
  buildSourceFilters,
  calendarDateExpression,
  PERIOD_END_PARAMETER,
  PERIOD_START_PARAMETER,
  periodKeyExpression,
  sourceTimeExpression,
  TIME_ZONE_PARAMETER,
  valueExpression,
} from './query';
import {
  latestDistinctCountProjection,
  latestValueProjection,
} from './statTiles';

export const INCOMPLETE_ROW_COUNT_ALIAS = 'incomplete_row_count';
export const TIME_COUNT_ALIAS = 'time_count';
export const ROW_COUNT_ALIAS = 'row_count';

export function buildCandlestickQuery(
  plan: Extract<SectionQueryPlan, { kind: 'candlestick' }>
): BuiltQuery {
  const calendarDate = calendarDateExpression(plan.source.time);
  const filters = buildSourceFilters(plan.source);
  const filteredSelections = [
    `${periodKeyExpression(plan.grain, calendarDate)} AS period`,
    `${sourceTimeExpression(plan.source.time)} AS source_time`,
    ...plan.measures.map(
      (measure, index) =>
        `${valueExpression(measure.column)} AS ${valueColumnAlias(index)}`
    ),
  ];
  const sql = [
    'WITH filtered AS (',
    `SELECT ${filteredSelections.join(', ')}`,
    `FROM ${qualifiedView(plan.source.dataset, plan.source.view)}`,
    `WHERE ${calendarDate} >= CAST(@${PERIOD_START_PARAMETER} AS DATE)`,
    `AND ${calendarDate} <= CAST(@${PERIOD_END_PARAMETER} AS DATE)`,
    ...filters.clauses.map((clause) => `AND ${clause}`),
    '),',
    'bucket_times AS (SELECT period, MIN(source_time) AS earliest_time, MAX(source_time) AS latest_time FROM filtered GROUP BY period)',
    'SELECT filtered.period,',
    'CAST(ARRAY_AGG(STRUCT(source_time, value_0) ORDER BY source_time ASC LIMIT 1)[SAFE_OFFSET(0)].value_0 AS FLOAT64) AS value_0,',
    `CAST(COUNT(DISTINCT IF(source_time = earliest_time, TO_JSON_STRING(value_0), NULL)) AS FLOAT64) AS ${distinctCountAlias(0)},`,
    'CAST(MAX(value_1) AS FLOAT64) AS value_1,',
    'CAST(MIN(value_2) AS FLOAT64) AS value_2,',
    `${latestValueProjection('value_3')},`,
    `${latestDistinctCountProjection('value_3', 3)},`,
    `CAST(COUNTIF(value_0 IS NULL OR value_1 IS NULL OR value_2 IS NULL OR value_3 IS NULL) AS FLOAT64) AS ${INCOMPLETE_ROW_COUNT_ALIAS},`,
    `CAST(COUNT(DISTINCT source_time) AS FLOAT64) AS ${TIME_COUNT_ALIAS},`,
    `CAST(COUNT(*) AS FLOAT64) AS ${ROW_COUNT_ALIAS}`,
    'FROM filtered JOIN bucket_times USING (period)',
    'GROUP BY filtered.period',
    'ORDER BY filtered.period DESC',
    'LIMIT @bucket_limit',
  ].join('\n');

  return {
    sql,
    params: {
      [PERIOD_START_PARAMETER]: plan.dateRange.firstDate,
      [PERIOD_END_PARAMETER]: plan.dateRange.lastDate,
      [TIME_ZONE_PARAMETER]: plan.timeZone,
      ...filters.params,
      bucket_limit: plan.bucketLimit + 1,
    },
  };
}
