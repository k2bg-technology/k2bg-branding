import { describe, expect, it } from 'vitest';

import { Period, planMatrixHeatmapSection } from '../../../../domain';
import sampleDashboard from '../../../../fixtures/sample-dashboard.json';
import { dashboardDefinitionSchema } from '../../definition-sources/file-system/schemas';
import { buildMatrixQuery } from './matrixHeatmap';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const period = Period.parse('month', '2026-08');
if (period === null) throw new Error('Expected fixture period');

function fixtureSection(id: string) {
  const section = dashboard.sections.find((candidate) => candidate.id === id);
  if (section?.kind !== 'matrix-heatmap') {
    throw new Error(`Expected matrix fixture ${id}`);
  }
  return section;
}

describe('buildMatrixQuery', () => {
  it('builds the fixture hour by date query with validated hours', () => {
    const section = fixtureSection('hourly-readings');
    const sut = buildMatrixQuery;
    const validatedHour =
      "IF(`reading_hour` BETWEEN 0 AND 23, `reading_hour`, ERROR('source.time.hour must be an integer from 0 through 23'))";

    const result = sut(
      planMatrixHeatmapSection(section, period, dashboard.timeZone)
    );

    expect(result).toEqual({
      sql: [
        'WITH filtered AS (',
        `SELECT FORMAT('%02d', ${validatedHour}) AS row_group, FORMAT_DATE('%F', \`reading_date\`) AS column_group, CAST(\`temperature\` AS FLOAT64) AS value_0`,
        'FROM `sample_dataset.daily_readings`',
        'WHERE `reading_date` >= CAST(@period_start AS DATE)',
        'AND `reading_date` <= CAST(@period_end AS DATE)',
        `AND ${validatedHour} IS NOT NULL`,
        ')',
        'SELECT row_group AS row_key, column_group AS column_key, CAST(AVG(value_0) AS FLOAT64) AS value_0',
        'FROM filtered',
        'GROUP BY row_group, column_group',
        'ORDER BY row_group, column_group',
        'LIMIT @cell_limit',
      ].join('\n'),
      params: {
        period_start: '2026-08-01',
        period_end: '2026-08-31',
        time_zone: 'Asia/Tokyo',
        cell_limit: 2001,
      },
    });
  });

  it('builds the fixture category by date query over 84 trailing days with ranked categories', () => {
    const section = fixtureSection('daily-category-totals');
    const sut = buildMatrixQuery;

    const result = sut(
      planMatrixHeatmapSection(section, period, dashboard.timeZone)
    );

    expect(result).toEqual({
      sql: [
        'WITH filtered AS (',
        "SELECT `category` AS row_group, FORMAT_DATE('%F', DATE(`recorded_at`, @time_zone)) AS column_group, ABS(CAST(`amount` AS FLOAT64)) AS value_0",
        'FROM `sample_dataset.entries`',
        'WHERE DATE(`recorded_at`, @time_zone) >= CAST(@period_start AS DATE)',
        'AND DATE(`recorded_at`, @time_zone) <= CAST(@period_end AS DATE)',
        'AND `category` != @filter_0',
        ')',
        'SELECT CAST(row_group AS STRING) AS row_key, DENSE_RANK() OVER (ORDER BY row_group IS NULL, row_group) AS row_rank, column_group AS column_key, CAST(SUM(value_0) AS FLOAT64) AS value_0',
        'FROM filtered',
        'GROUP BY row_group, column_group',
        'ORDER BY row_group IS NULL, row_group, column_group',
        'LIMIT @cell_limit',
      ].join('\n'),
      params: {
        period_start: '2026-06-09',
        period_end: '2026-08-31',
        time_zone: 'Asia/Tokyo',
        filter_0: 'transfer',
        cell_limit: 2001,
      },
    });
  });
});
