import { describe, expect, it, vi } from 'vitest';

vi.mock('../../modules/dashboard/adapters/shared', () => ({
  dashboardLogger: { error: vi.fn(), warn: vi.fn() },
}));

import {
  type DashboardDefinition,
  Period,
} from '../../modules/dashboard/domain';
import { loadSectionState } from './loadSectionState';

describe('loadSectionState bars ranking', () => {
  it('ranks by the declared second series when the first series disagrees', async () => {
    const dashboard: DashboardDefinition = {
      id: 'summary',
      title: 'Summary',
      grain: 'month',
      timeZone: 'UTC',
      locale: 'en-US',
      revalidate: 86_400,
      defaultPeriod: 'latest-with-data',
      sections: [
        {
          id: 'bars',
          title: 'Bars',
          kind: 'bars',
          source: { dataset: 'metrics', view: 'entries', time: 'recorded_on' },
          x: {
            axis: 'category',
            column: 'category',
            by: 'count',
            topN: { count: 1, otherLabel: 'Other categories' },
            order: 'value-desc',
          },
          series: [
            { label: 'Amount', column: 'amount', reduction: 'sum' },
            { label: 'Count', column: 'count', reduction: 'sum' },
          ],
          stacked: false,
          format: { type: 'number' },
        },
      ],
    };
    const period = Period.parse('month', '2026-08');
    if (period === null) throw new Error('Expected period');

    const state = await loadSectionState({
      dashboard,
      section: dashboard.sections[0],
      periodResolution: Promise.resolve({
        period,
        bounds: { firstDate: period.firstDate, lastDate: period.lastDate },
        previousTarget: null,
        nextTarget: null,
      }),
      resolveSectionGate: async () => ({ status: 'open', period }),
      fetchSectionData: async () => null,
      fetchTableRows: async () => null,
      fetchBarsData: async () => ({
        grouping: 'category',
        groups: [
          { category: 'A', values: [100, 1] },
          { category: 'B', values: [10, 20] },
        ],
      }),
      page: 1,
      selections: {},
    });

    expect(state.status).toBe('ready');
    if (state.status !== 'ready' || state.kind !== 'bars')
      throw new Error('Expected bars state');
    expect(state.chart.categories).toEqual(['B', 'Other categories']);
    expect(state.chart.series).toEqual([
      { id: 'series-0', label: 'Amount', values: [10, 100] },
      { id: 'series-1', label: 'Count', values: [20, 1] },
    ]);
  });
});
