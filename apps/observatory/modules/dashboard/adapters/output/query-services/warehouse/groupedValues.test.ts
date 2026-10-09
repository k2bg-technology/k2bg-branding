import { describe, expect, it } from 'vitest';

import {
  type BarsSection,
  type GroupedValuesPlan,
  Period,
  planBarsSection,
} from '../../../../domain';
import sampleDashboard from '../../../../fixtures/sample-dashboard.json';
import { RepositoryError } from '../../../shared';
import { dashboardDefinitionSchema } from '../../definition-sources/file-system/schemas';
import { buildGroupedValuesQuery } from './groupedValues';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const period = Period.parse('month', '2026-08');
if (period === null) throw new Error('Expected fixture period');

function fixtureSection(id: string): BarsSection {
  const section = dashboard.sections.find((candidate) => candidate.id === id);
  if (section?.kind !== 'bars') throw new Error(`Expected bars fixture ${id}`);
  return section;
}

const bounds = [
  'WHERE DATE(`recorded_at`, @time_zone) >= CAST(@period_start AS DATE)',
  'AND DATE(`recorded_at`, @time_zone) <= CAST(@period_end AS DATE)',
];

describe('buildGroupedValuesQuery', () => {
  it('builds the exact pivot query with bound filter and a period cap', () => {
    const result = buildGroupedValuesQuery(
      planBarsSection(
        fixtureSection('category-trend'),
        period,
        dashboard.timeZone
      )
    );

    expect(result).toEqual({
      sql: [
        'WITH filtered AS (',
        "SELECT FORMAT_DATE('%Y-%m', DATE(`recorded_at`, @time_zone)) AS period, CAST(`category` AS STRING) AS category, ABS(CAST(`amount` AS FLOAT64)) AS value_0",
        'FROM `sample_dataset.entries`',
        ...bounds,
        'AND `category` != @filter_0',
        '),',
        'periods AS (SELECT DISTINCT period FROM filtered ORDER BY period DESC LIMIT @bucket_limit)',
        'SELECT period, category, CAST(SUM(value_0) AS FLOAT64) AS value_0',
        'FROM filtered JOIN periods USING (period)',
        'GROUP BY period, category',
        'ORDER BY period DESC, category',
      ].join('\n'),
      params: {
        period_start: '2025-09-01',
        period_end: '2026-08-31',
        time_zone: 'Asia/Tokyo',
        filter_0: 'transfer',
        bucket_limit: 121,
      },
    });
    expect(result.sql).not.toContain('transfer');
  });

  it('builds the exact category ranking query without a period cap', () => {
    const result = buildGroupedValuesQuery(
      planBarsSection(
        fixtureSection('category-ranking'),
        period,
        dashboard.timeZone
      )
    );

    expect(result).toEqual({
      sql: [
        'WITH filtered AS (',
        'SELECT CAST(`category` AS STRING) AS category, ABS(CAST(`amount` AS FLOAT64)) AS value_0',
        'FROM `sample_dataset.entries`',
        ...bounds,
        ')',
        'SELECT category, CAST(SUM(value_0) AS FLOAT64) AS value_0',
        'FROM filtered',
        'GROUP BY category',
        'ORDER BY category',
      ].join('\n'),
      params: {
        period_start: '2026-08-01',
        period_end: '2026-08-31',
        time_zone: 'Asia/Tokyo',
      },
    });
    expect(result.sql).not.toContain('periods AS');
    expect(result.sql).not.toContain('@bucket_limit');
  });

  it('builds the exact numeric sort key query', () => {
    const result = buildGroupedValuesQuery(
      planBarsSection(
        fixtureSection('weekday-totals'),
        period,
        dashboard.timeZone
      )
    );

    expect(result).toEqual({
      sql: [
        'WITH filtered AS (',
        'SELECT CAST(`weekday_name` AS STRING) AS category, CAST(`weekday_number` AS FLOAT64) AS sort_key, ABS(CAST(`amount` AS FLOAT64)) AS value_0, CAST(`amount` AS FLOAT64) AS value_1',
        'FROM `sample_dataset.entries`',
        ...bounds,
        ')',
        'SELECT category, CAST(SUM(value_0) AS FLOAT64) AS value_0,',
        'CAST(AVG(value_1) AS FLOAT64) AS value_1,',
        'MIN(sort_key) AS sort_key,',
        'CAST(COUNT(DISTINCT sort_key) AS FLOAT64) AS sort_key_distinct_count',
        'FROM filtered',
        'GROUP BY category',
        'ORDER BY category',
      ].join('\n'),
      params: {
        period_start: '2026-08-01',
        period_end: '2026-08-31',
        time_zone: 'Asia/Tokyo',
      },
    });
    expect(result.sql).not.toContain('periods AS');
    expect(result.sql).not.toContain('@bucket_limit');
  });

  it('keeps latest values for NULL categories using a window partition', () => {
    const plan: GroupedValuesPlan = {
      sectionId: 'balance',
      source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
      timeZone: 'Asia/Tokyo',
      dateRange: { firstDate: '2026-08-01', lastDate: '2026-08-31' },
      measures: [
        { column: 'balance', reduction: 'latest' },
        { column: 'income', reduction: 'sum' },
      ],
      buckets: { grain: 'month', bucketLimit: 120 },
      category: null,
    };

    expect(buildGroupedValuesQuery(plan)).toEqual({
      sql: [
        'WITH filtered AS (',
        "SELECT FORMAT_DATE('%Y-%m', DATE(TIMESTAMP(DATETIME(`recorded_on`), @time_zone), @time_zone)) AS period, `recorded_on` AS source_time, CAST(`balance` AS FLOAT64) AS value_0, CAST(`income` AS FLOAT64) AS value_1",
        'FROM `metrics.monthly`',
        'WHERE DATE(TIMESTAMP(DATETIME(`recorded_on`), @time_zone), @time_zone) >= CAST(@period_start AS DATE)',
        'AND DATE(TIMESTAMP(DATETIME(`recorded_on`), @time_zone), @time_zone) <= CAST(@period_end AS DATE)',
        '),',
        'keyed AS (SELECT *, MAX(source_time) OVER (PARTITION BY period) AS latest_time FROM filtered),',
        'periods AS (SELECT DISTINCT period FROM filtered ORDER BY period DESC LIMIT @bucket_limit)',
        'SELECT period, CAST( ARRAY_AGG(STRUCT(source_time, value_0) ORDER BY source_time DESC LIMIT 1)[SAFE_OFFSET(0)].value_0 AS FLOAT64) AS value_0,',
        'CAST(COUNT(DISTINCT IF(source_time = latest_time, TO_JSON_STRING(value_0), NULL)) AS FLOAT64) AS distinct_count_0,',
        'CAST(SUM(value_1) AS FLOAT64) AS value_1',
        'FROM keyed JOIN periods USING (period)',
        'GROUP BY period',
        'ORDER BY period DESC',
      ].join('\n'),
      params: {
        period_start: '2026-08-01',
        period_end: '2026-08-31',
        time_zone: 'Asia/Tokyo',
        bucket_limit: 121,
      },
    });
  });

  it('validates a date-and-hour source and keeps the latest value by its hour', () => {
    const plan: GroupedValuesPlan = {
      sectionId: 'readings',
      source: {
        dataset: 'home',
        view: 'readings',
        time: { date: 'reading_date', hour: 'reading_hour' },
      },
      timeZone: 'Asia/Tokyo',
      dateRange: { firstDate: '2026-08-01', lastDate: '2026-08-31' },
      measures: [{ column: 'temperature', reduction: 'latest' }],
      buckets: null,
      category: { column: 'room', sortKey: null },
    };

    const result = buildGroupedValuesQuery(plan);

    const validatedHour =
      "IF(`reading_hour` BETWEEN 0 AND 23, `reading_hour`, ERROR('source.time.hour must be an integer from 0 through 23'))";
    expect(result.sql.split('\n').slice(0, 6)).toEqual([
      'WITH filtered AS (',
      `SELECT CAST(\`room\` AS STRING) AS category, DATETIME(\`reading_date\`, TIME(${validatedHour}, 0, 0)) AS source_time, CAST(\`temperature\` AS FLOAT64) AS value_0`,
      'FROM `home.readings`',
      'WHERE `reading_date` >= CAST(@period_start AS DATE)',
      'AND `reading_date` <= CAST(@period_end AS DATE)',
      `AND ${validatedHour} IS NOT NULL`,
    ]);
  });

  it('rejects unsafe identifiers and a plan without a grouping key', () => {
    const plan = planBarsSection(
      fixtureSection('category-ranking'),
      period,
      dashboard.timeZone
    );
    expect(() =>
      buildGroupedValuesQuery({
        ...plan,
        category: { column: 'unsafe-name', sortKey: null },
      })
    ).toThrow(RepositoryError);
    expect(() => buildGroupedValuesQuery({ ...plan, category: null })).toThrow(
      'Grouped values require a period or category key'
    );
  });
});
