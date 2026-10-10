import { describe, expect, it } from 'vitest';
import {
  Period,
  type PivotQueryPlan,
  planPivotTableSection,
} from '../../../../domain';
import sampleDashboard from '../../../../fixtures/sample-dashboard.json';
import { RepositoryError } from '../../../shared';
import { dashboardDefinitionSchema } from '../../definition-sources/file-system/schemas';
import { buildPivotQuery } from './pivotTable';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const period = Period.parse('month', '2026-08');
if (period === null) throw new Error('Expected fixture period');
const fixtureSection = (id: string) => {
  const section = dashboard.sections.find((candidate) => candidate.id === id);
  if (section?.kind !== 'pivot-table')
    throw new Error('Expected pivot fixture');
  return section;
};

describe('buildPivotQuery', () => {
  it('builds the exact time-axis query with bound filters', () => {
    const sut = buildPivotQuery(
      planPivotTableSection(
        fixtureSection('category-pivot'),
        period,
        dashboard.timeZone
      )
    );

    expect(sut).toEqual({
      sql: [
        'WITH filtered AS (',
        "SELECT CAST(`category` AS STRING) AS row_key, FORMAT_DATE('%Y-%m', DATE(`recorded_at`, @time_zone)) AS column_key, ABS(CAST(`amount` AS FLOAT64)) AS value_0",
        'FROM `sample_dataset.entries`',
        'WHERE DATE(`recorded_at`, @time_zone) >= CAST(@period_start AS DATE)',
        'AND DATE(`recorded_at`, @time_zone) <= CAST(@period_end AS DATE)',
        'AND `category` != @filter_0',
        ')',
        'SELECT row_key, column_key, CAST(SUM(value_0) AS FLOAT64) AS value_0',
        'FROM filtered',
        'GROUP BY row_key, column_key',
        'ORDER BY row_key, column_key',
        'LIMIT @cell_limit',
      ].join('\n'),
      params: {
        period_start: '2025-09-01',
        period_end: '2026-08-31',
        time_zone: 'Asia/Tokyo',
        filter_0: 'transfer',
        cell_limit: 10001,
      },
    });
    expect(sut.sql).not.toContain('transfer');
  });

  it('builds the exact category-axis query', () => {
    const sut = buildPivotQuery(
      planPivotTableSection(
        fixtureSection('category-by-weekday'),
        period,
        dashboard.timeZone
      )
    );

    expect(sut).toEqual({
      sql: [
        'WITH filtered AS (',
        'SELECT CAST(`category` AS STRING) AS row_key, CAST(`weekday_name` AS STRING) AS column_key, CAST(`amount` AS FLOAT64) AS value_0',
        'FROM `sample_dataset.entries`',
        'WHERE DATE(`recorded_at`, @time_zone) >= CAST(@period_start AS DATE)',
        'AND DATE(`recorded_at`, @time_zone) <= CAST(@period_end AS DATE)',
        ')',
        'SELECT row_key, column_key, CAST(AVG(value_0) AS FLOAT64) AS value_0',
        'FROM filtered',
        'GROUP BY row_key, column_key',
        'ORDER BY row_key, column_key',
        'LIMIT @cell_limit',
      ].join('\n'),
      params: {
        period_start: '2026-08-01',
        period_end: '2026-08-31',
        time_zone: 'Asia/Tokyo',
        cell_limit: 10001,
      },
    });
  });

  it('builds the exact latest query with a sort key', () => {
    const plan: PivotQueryPlan = {
      sectionId: 'pivot',
      source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
      timeZone: 'UTC',
      dateRange: { firstDate: '2026-08-01', lastDate: '2026-08-31' },
      rowKey: {
        column: 'weekday_name',
        sortKey: { column: 'weekday_number', type: 'number' },
      },
      columnKey: { kind: 'category', column: 'category' },
      measure: { column: 'balance', reduction: 'latest' },
      cellLimit: 10_000,
    };

    expect(buildPivotQuery(plan)).toEqual({
      sql: [
        'WITH filtered AS (',
        'SELECT CAST(`weekday_name` AS STRING) AS row_key, CAST(`category` AS STRING) AS column_key, `recorded_on` AS source_time, CAST(`weekday_number` AS FLOAT64) AS sort_key, CAST(`balance` AS FLOAT64) AS value_0',
        'FROM `metrics.monthly`',
        'WHERE DATE(TIMESTAMP(DATETIME(`recorded_on`), @time_zone), @time_zone) >= CAST(@period_start AS DATE)',
        'AND DATE(TIMESTAMP(DATETIME(`recorded_on`), @time_zone), @time_zone) <= CAST(@period_end AS DATE)',
        '),',
        'keyed AS (SELECT *, MAX(source_time) OVER (PARTITION BY row_key, column_key) AS latest_time FROM filtered)',
        'SELECT row_key, column_key, CAST( ARRAY_AGG(STRUCT(source_time, value_0) ORDER BY source_time DESC LIMIT 1)[SAFE_OFFSET(0)].value_0 AS FLOAT64) AS value_0,',
        'CAST(COUNT(DISTINCT IF(source_time = latest_time, TO_JSON_STRING(value_0), NULL)) AS FLOAT64) AS distinct_count_0,',
        'MIN(sort_key) AS sort_key,',
        'CAST(COUNT(DISTINCT TO_JSON_STRING(sort_key)) AS FLOAT64) AS sort_key_distinct_count',
        'FROM keyed',
        'GROUP BY row_key, column_key',
        'ORDER BY row_key, column_key',
        'LIMIT @cell_limit',
      ].join('\n'),
      params: {
        period_start: '2026-08-01',
        period_end: '2026-08-31',
        time_zone: 'UTC',
        cell_limit: 10001,
      },
    });
  });

  it('rejects an unsafe row identifier', () => {
    const plan = planPivotTableSection(
      fixtureSection('category-pivot'),
      period,
      dashboard.timeZone
    );
    expect(() =>
      buildPivotQuery({
        ...plan,
        rowKey: { column: 'category; DROP', sortKey: null },
      })
    ).toThrow(RepositoryError);
  });
});
