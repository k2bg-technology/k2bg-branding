import { describe, expect, it } from 'vitest';

import type { SectionQueryPlan } from '../../../../domain';
import { buildSectionQuery } from './buildSectionQuery';

describe('candlestick warehouse query', () => {
  it.each([
    {
      grain: 'day',
      dateFormat: '%F',
      firstDate: '2026-02-19',
      lastDate: '2026-02-28',
    },
    {
      grain: 'month',
      dateFormat: '%Y-%m',
      firstDate: '2026-01-01',
      lastDate: '2026-02-28',
    },
  ] as const)(
    'binds the time range, source filter, and cap for $grain buckets',
    ({ grain, dateFormat, firstDate, lastDate }) => {
      const plan: SectionQueryPlan = {
        kind: 'candlestick',
        sectionId: 'quotes',
        grain,
        source: {
          dataset: 'sample_dataset',
          view: 'daily_quotes',
          time: { column: 'recorded_at', type: 'timestamp' },
          filters: [{ column: 'code', operator: 'equals', value: 'A' }],
        },
        timeZone: 'Asia/Tokyo',
        selectedPeriod: '2026-02',
        dateRange: { firstDate, lastDate },
        measures: [
          { column: 'opening_value', reduction: 'earliest' },
          { column: 'highest_value', reduction: 'maximum' },
          { column: 'lowest_value', reduction: 'minimum' },
          { column: 'closing_value', reduction: 'latest' },
        ],
        bucketLimit: 120,
      };
      const sut = buildSectionQuery;

      const query = sut(plan);

      expect(query).toEqual({
        sql: [
          'WITH filtered AS (',
          `SELECT FORMAT_DATE('${dateFormat}', DATE(\`recorded_at\`, @time_zone)) AS period, \`recorded_at\` AS source_time, CAST(\`opening_value\` AS FLOAT64) AS value_0, CAST(\`highest_value\` AS FLOAT64) AS value_1, CAST(\`lowest_value\` AS FLOAT64) AS value_2, CAST(\`closing_value\` AS FLOAT64) AS value_3`,
          'FROM `sample_dataset.daily_quotes`',
          'WHERE DATE(`recorded_at`, @time_zone) >= CAST(@period_start AS DATE)',
          'AND DATE(`recorded_at`, @time_zone) <= CAST(@period_end AS DATE)',
          'AND `code` = @filter_0',
          '),',
          'bucket_times AS (SELECT period, MIN(source_time) AS earliest_time, MAX(source_time) AS latest_time FROM filtered GROUP BY period)',
          'SELECT filtered.period,',
          'CAST(ARRAY_AGG(STRUCT(source_time, value_0) ORDER BY source_time ASC LIMIT 1)[SAFE_OFFSET(0)].value_0 AS FLOAT64) AS value_0,',
          'CAST(COUNT(DISTINCT IF(source_time = earliest_time, TO_JSON_STRING(value_0), NULL)) AS FLOAT64) AS distinct_count_0,',
          'CAST(MAX(value_1) AS FLOAT64) AS value_1,',
          'CAST(MIN(value_2) AS FLOAT64) AS value_2,',
          'CAST( ARRAY_AGG(STRUCT(source_time, value_3) ORDER BY source_time DESC LIMIT 1)[SAFE_OFFSET(0)].value_3 AS FLOAT64) AS value_3,',
          'CAST(COUNT(DISTINCT IF(source_time = latest_time, TO_JSON_STRING(value_3), NULL)) AS FLOAT64) AS distinct_count_3,',
          'CAST(COUNTIF(value_0 IS NULL OR value_1 IS NULL OR value_2 IS NULL OR value_3 IS NULL) AS FLOAT64) AS incomplete_row_count,',
          'CAST(COUNT(DISTINCT source_time) AS FLOAT64) AS time_count,',
          'CAST(COUNT(*) AS FLOAT64) AS row_count',
          'FROM filtered JOIN bucket_times USING (period)',
          'GROUP BY filtered.period',
          'ORDER BY filtered.period DESC',
          'LIMIT @bucket_limit',
        ].join('\n'),
        params: {
          period_start: firstDate,
          period_end: lastDate,
          time_zone: 'Asia/Tokyo',
          filter_0: 'A',
          bucket_limit: 121,
        },
      });
    }
  );
});
