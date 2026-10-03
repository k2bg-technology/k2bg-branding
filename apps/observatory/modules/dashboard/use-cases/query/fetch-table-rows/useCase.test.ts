import { describe, expect, it } from 'vitest';

import {
  type DashboardDefinition,
  Period,
  type TableQueryPlan,
} from '../../../domain';
import { FetchTableRows } from './useCase';

describe('FetchTableRows', () => {
  it('plans the selected month, page, sort, and cache window', async () => {
    const dashboard: DashboardDefinition = {
      id: 'summary',
      title: 'Summary',
      grain: 'month',
      timeZone: 'Asia/Tokyo',
      locale: 'en-US',
      revalidate: 3_600,
      defaultPeriod: 'latest-with-data',
      sections: [
        {
          id: 'detail',
          title: 'Detail',
          kind: 'table',
          source: { dataset: 'metrics', view: 'entries', time: 'recorded_on' },
          columns: [{ header: 'Date', column: 'occurred_on', type: 'date' }],
          sort: { column: 'occurred_on', direction: 'descending' },
          paging: { pageSize: 20 },
        },
      ],
    };
    const section = dashboard.sections[0];
    const period = Period.parse('month', '2026-08');
    if (section.kind !== 'table' || period === null) {
      throw new Error('Expected table and period fixtures');
    }
    const queryService = {
      fetchTableRows: async (
        plan: TableQueryPlan,
        options: { name: string; revalidate: number }
      ) =>
        plan.dateRange.firstDate === '2026-08-01' &&
        plan.dateRange.lastDate === '2026-08-31' &&
        'pageSize' in plan.rows &&
        plan.rows.pageSize === 20 &&
        plan.rows.page === 3 &&
        plan.sort?.columnIndex === 0 &&
        plan.sort.direction === 'descending' &&
        options.revalidate === 3_600
          ? { rows: [['2026-08-15']], page: { number: 3, count: 3 } }
          : null,
    };
    const sut = new FetchTableRows(queryService);

    expect(await sut.execute({ dashboard, section, period, page: 3 })).toEqual({
      rows: [['2026-08-15']],
      page: { number: 3, count: 3 },
    });
  });
});
