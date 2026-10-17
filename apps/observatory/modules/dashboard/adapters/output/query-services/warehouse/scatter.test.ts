import { describe, expect, it } from 'vitest';
import { Period, planScatterPoints } from '../../../../domain';
import sampleDashboard from '../../../../fixtures/sample-dashboard.json';
import { dashboardDefinitionSchema } from '../../definition-sources/file-system/schemas';
import { buildScatterQuery } from './scatter';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const section = dashboard.sections.find(
  (candidate) => candidate.id === 'balance-by-amount'
);
const period = Period.parse('month', '2026-08');
if (section?.kind !== 'scatter' || period === null)
  throw new Error('Expected scatter fixture');
const plan = planScatterPoints(section, period, dashboard.timeZone);

describe('buildScatterQuery', () => {
  it('builds the exact newest-first points query with a bound control filter', () => {
    const sut = buildScatterQuery({
      ...plan,
      source: {
        ...plan.source,
        filters: [
          { column: 'category', operator: 'equals', value: 'reporting' },
        ],
      },
    });
    expect(sut).toEqual({
      sql: [
        'WITH projected AS (',
        'SELECT `recorded_at` AS source_time, CAST(`amount` AS FLOAT64) AS x_value, CAST(`running_balance` AS FLOAT64) AS y_value, CAST(`category` AS STRING) AS series_key',
        'FROM `sample_dataset.entries`',
        'WHERE DATE(`recorded_at`, @time_zone) >= CAST(@period_start AS DATE)',
        'AND DATE(`recorded_at`, @time_zone) <= CAST(@period_end AS DATE)',
        'AND `category` = @filter_0',
        ')',
        'SELECT x_value, y_value, series_key',
        'FROM projected',
        'WHERE x_value IS NOT NULL AND y_value IS NOT NULL',
        'ORDER BY source_time DESC NULLS LAST, x_value ASC, y_value ASC, series_key ASC NULLS LAST',
        'LIMIT @row_limit',
      ].join('\n'),
      params: {
        period_start: '2026-08-01',
        period_end: '2026-08-31',
        time_zone: 'Asia/Tokyo',
        filter_0: 'reporting',
        row_limit: 201,
      },
    });
    expect(sut.sql).not.toContain('balance_slope');
    expect(sut.sql).not.toContain('balance_intercept');
    expect(sut.sql).not.toContain('reporting');
    expect(sut.sql).not.toContain('GROUP BY');
  });

  it('omits the series key without a series', () => {
    const sut = buildScatterQuery({ ...plan, series: null });
    expect(sut.sql).toContain(
      'SELECT `recorded_at` AS source_time, CAST(`amount` AS FLOAT64) AS x_value, CAST(`running_balance` AS FLOAT64) AS y_value\n'
    );
    expect(sut.sql).toContain('SELECT x_value, y_value\nFROM projected');
    expect(sut.sql).toContain(
      'ORDER BY source_time DESC NULLS LAST, x_value ASC, y_value ASC\nLIMIT @row_limit'
    );
    expect(sut.params).toEqual({
      period_start: '2026-08-01',
      period_end: '2026-08-31',
      time_zone: 'Asia/Tokyo',
      row_limit: 201,
    });
  });
});
