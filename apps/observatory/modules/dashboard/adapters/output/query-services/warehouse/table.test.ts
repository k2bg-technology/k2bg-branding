import { describe, expect, it } from 'vitest';

import {
  Period,
  planTableSection,
  type TableQueryPlan,
} from '../../../../domain';
import sampleDashboard from '../../../../fixtures/sample-dashboard.json';
import { RepositoryError } from '../../../shared';
import { dashboardDefinitionSchema } from '../../definition-sources/file-system/schemas';
import { buildTableQuery } from './table';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const period = Period.parse('month', '2026-08');
if (period === null) {
  throw new Error('Expected fixture period');
}
const largest = dashboard.sections[2];
const detail = dashboard.sections[3];
if (largest.kind !== 'table' || detail.kind !== 'table') {
  throw new Error('Expected table fixtures');
}

describe('buildTableQuery', () => {
  it('builds the exact top-N row query', () => {
    const result = buildTableQuery(
      planTableSection(largest, period, dashboard.timeZone, 1)
    );

    expect(result).toEqual({
      sql: [
        'WITH projected AS (',
        "SELECT `recorded_at` AS source_time, FORMAT_DATE('%F', `occurred_on`) AS cell_0, CAST(`description` AS STRING) AS cell_1, ABS(CAST(`amount` AS FLOAT64)) AS cell_2",
        'FROM `sample_dataset.entries`',
        'WHERE DATE(`recorded_at`, @time_zone) >= CAST(@period_start AS DATE)',
        'AND DATE(`recorded_at`, @time_zone) <= CAST(@period_end AS DATE)',
        ')',
        'SELECT cell_0, cell_1, cell_2',
        'FROM projected',
        'ORDER BY cell_2 DESC NULLS LAST, cell_0 ASC NULLS LAST, cell_1 ASC NULLS LAST',
        'LIMIT @row_limit',
      ].join('\n'),
      params: {
        period_start: '2026-08-01',
        period_end: '2026-08-31',
        time_zone: 'Asia/Tokyo',
        row_limit: 10,
      },
    });
    expect(result.sql).not.toContain('GROUP BY');
  });

  it('builds the exact clamped page query with bound filter', () => {
    const result = buildTableQuery(
      planTableSection(detail, period, dashboard.timeZone, 3)
    );

    expect(result).toEqual({
      sql: [
        'WITH projected AS (',
        "SELECT `recorded_at` AS source_time, FORMAT_DATE('%F', `occurred_on`) AS cell_0, CAST(`description` AS STRING) AS cell_1, CAST(UNIX_MILLIS(`recorded_at`) AS FLOAT64) AS cell_2, CAST(`code` AS STRING) AS cell_3, CAST(`amount` AS FLOAT64) AS cell_4",
        'FROM `sample_dataset.entries`',
        'WHERE DATE(`recorded_at`, @time_zone) >= CAST(@period_start AS DATE)',
        'AND DATE(`recorded_at`, @time_zone) <= CAST(@period_end AS DATE)',
        'AND `category` != @filter_0',
        '),',
        'numbered AS (',
        'SELECT cell_0, cell_1, cell_2, cell_3, cell_4, ROW_NUMBER() OVER (ORDER BY cell_0 DESC NULLS LAST, cell_1 ASC NULLS LAST, cell_2 ASC NULLS LAST, cell_3 ASC NULLS LAST, cell_4 ASC NULLS LAST) AS row_position, COUNT(*) OVER () AS row_count',
        'FROM projected',
        '),',
        'paged AS (',
        'SELECT *, LEAST((@page - 1) * @page_size, DIV(row_count - 1, @page_size) * @page_size) AS page_offset',
        'FROM numbered',
        ')',
        'SELECT cell_0, cell_1, cell_2, cell_3, cell_4, CAST(DIV(page_offset, @page_size) + 1 AS FLOAT64) AS page_number, CAST(DIV(row_count - 1, @page_size) + 1 AS FLOAT64) AS page_count',
        'FROM paged',
        'WHERE row_position > page_offset AND row_position <= page_offset + @page_size',
        'ORDER BY row_position',
      ].join('\n'),
      params: {
        period_start: '2026-08-01',
        period_end: '2026-08-31',
        time_zone: 'Asia/Tokyo',
        filter_0: 'transfer',
        page: 3,
        page_size: 20,
      },
    });
    expect(result.sql).not.toContain('GROUP BY');
    expect(result.sql).not.toContain('transfer');
  });

  it('orders by source time and all cells when sort is absent', () => {
    const query = buildTableQuery({
      ...planTableSection(largest, period, dashboard.timeZone, 1),
      sort: null,
    });
    expect(query.sql).toContain(
      'ORDER BY source_time DESC NULLS LAST, cell_0 ASC NULLS LAST, cell_1 ASC NULLS LAST, cell_2 ASC NULLS LAST'
    );
  });

  it('orders once by an ascending transformed cell', () => {
    const plan = planTableSection(largest, period, dashboard.timeZone, 1);
    plan.sort = { columnIndex: 2, direction: 'ascending' };
    plan.columns[2].transform = 'negate';
    const query = buildTableQuery(plan);
    expect(query.sql).toContain('-(CAST(`amount` AS FLOAT64)) AS cell_2');
    expect(query.sql).toContain(
      'ORDER BY cell_2 ASC NULLS LAST, cell_0 ASC NULLS LAST, cell_1 ASC NULLS LAST'
    );
  });

  it('projects duplicate source columns to distinct aliases', () => {
    const plan = planTableSection(largest, period, dashboard.timeZone, 1);
    plan.columns = [
      { column: 'description', type: 'text' },
      { column: 'description', type: 'text' },
    ];
    plan.sort = null;
    const query = buildTableQuery(plan);
    expect(query.sql).toContain(
      'CAST(`description` AS STRING) AS cell_0, CAST(`description` AS STRING) AS cell_1'
    );
    expect(query.sql).toContain('cell_0 ASC NULLS LAST, cell_1 ASC NULLS LAST');
  });

  it('rejects an unsafe identifier', () => {
    const plan: TableQueryPlan = planTableSection(
      largest,
      period,
      dashboard.timeZone,
      1
    );
    plan.columns[0].column = 'bad;drop';
    expect(() => buildTableQuery(plan)).toThrow(RepositoryError);
  });
});
