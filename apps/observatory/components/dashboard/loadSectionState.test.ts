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
      fetchMatrixData: async () => null,
      fetchBarsData: async () => ({
        grouping: 'category',
        groups: [
          { category: 'A', values: [100, 1] },
          { category: 'B', values: [10, 20] },
        ],
      }),
      fetchCompositionData: async () => null,
      fetchTimeSeriesPivot: async () => null,
      fetchRebaseBase: async () => null,
      fetchPivotData: async () => null,
      fetchScatterData: async () => null,
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

function timeSeriesInput() {
  const period = Period.parse('month', '2026-01');
  if (period === null) throw new Error('Expected month');
  const dashboard: DashboardDefinition = {
    id: 'summary',
    title: 'Summary',
    grain: 'month',
    timeZone: 'UTC',
    locale: 'en-US',
    revalidate: 86_400,
    defaultPeriod: 'latest-with-data',
    sections: [],
  };
  return {
    dashboard,
    section: {
      id: 'trend',
      title: 'Trend',
      kind: 'time-series',
      source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
      window: 12,
      variant: 'line',
      stacked: false,
      format: { type: 'number' },
      pivot: {
        column: 'category',
        value: { column: 'amount', reduction: 'sum' },
        topN: { count: 1, otherLabel: 'Other' },
        running: { kind: 'sum', label: '{category} to date' },
        normalize: { kind: 'rebase', base: { date: '2025-11-30' } },
      },
    },
    periodResolution: Promise.resolve({
      period,
      bounds: { firstDate: '2026-01-01', lastDate: '2026-01-31' },
      previousTarget: null,
      nextTarget: null,
    }),
    resolveSectionGate: async () => ({ status: 'open', period }),
    fetchSectionData: async () => null,
    fetchTableRows: async () => null,
    fetchBarsData: async () => null,
    fetchCompositionData: async () => null,
    fetchMatrixData: async () => null,
    fetchTimeSeriesPivot: async () => ({
      grouping: 'period-category',
      truncated: false,
      buckets: [
        {
          period: '2026-01',
          cells: [
            { category: 'food', values: [10] },
            { category: 'rent', values: [20] },
          ],
        },
      ],
    }),
    fetchRebaseBase: async () => null,
    fetchPivotData: async () => null,
    fetchScatterData: async () => null,
    page: 1,
    selections: {},
  } satisfies Parameters<typeof loadSectionState>[0];
}

describe('derived time-series loading', () => {
  it('attaches fixed bases and templated labels to pivot slots', async () => {
    const sut = loadSectionState;
    const input = timeSeriesInput();

    const state = await sut({
      ...input,
      fetchRebaseBase: async () => ({
        layout: 'pivot',
        bucket: {
          period: '2025-11',
          cells: [
            { category: 'rent', values: [50] },
            { category: 'food', values: [4] },
            { category: 'fun', values: [6] },
          ],
        },
      }),
    });

    if (state.status !== 'ready' || state.kind !== 'time-series')
      throw new Error('Expected time-series state');
    expect(state.slots).toEqual([
      {
        kind: 'line',
        id: 'category-0',
        label: 'rent',
        interpolation: undefined,
        valueIndex: 0,
        movingAverage: undefined,
        running: { kind: 'sum', label: 'rent to date' },
        rebase: { base: 'fixed', value: 50 },
      },
      {
        kind: 'line',
        id: 'remainder',
        label: 'Other',
        interpolation: undefined,
        valueIndex: 1,
        movingAverage: undefined,
        running: { kind: 'sum', label: 'Other to date' },
        rebase: { base: 'fixed', value: 10 },
      },
    ]);
    expect(state.data.warmUpBuckets).toBeUndefined();
  });

  it('reads no base for a first-value rebase', async () => {
    const sut = loadSectionState;
    const input = timeSeriesInput();
    if (input.section.kind !== 'time-series')
      throw new Error('Expected series');

    const state = await sut({
      ...input,
      section: {
        ...input.section,
        pivot: undefined,
        series: [
          {
            label: 'A',
            column: 'a',
            reduction: 'sum',
            normalize: { kind: 'rebase' },
          },
        ],
      },
      fetchSectionData: async () => ({
        buckets: [{ period: '2026-01', values: [80] }],
        truncated: false,
      }),
      fetchRebaseBase: async () => {
        throw new Error('not expected');
      },
    });

    expect(state.status).toBe('ready');
    if (state.status !== 'ready' || state.kind !== 'time-series')
      throw new Error('Expected time-series state');
    expect(state.slots[0]).toMatchObject({ rebase: { base: 'first' } });
  });

  it('renders empty when only warm-up buckets hold rows', async () => {
    const sut = loadSectionState;
    const input = timeSeriesInput();
    if (input.section.kind !== 'time-series')
      throw new Error('Expected series');

    const state = await sut({
      ...input,
      section: {
        ...input.section,
        pivot: {
          column: 'category',
          value: { column: 'amount', reduction: 'sum' },
          movingAverage: { window: 3, label: '{category} average' },
        },
      },
      fetchTimeSeriesPivot: async () => ({
        grouping: 'period-category',
        truncated: false,
        buckets: [],
        warmUpBuckets: [
          { period: '2025-12', cells: [{ category: 'rent', values: [20] }] },
        ],
      }),
    });

    expect(state).toEqual({ status: 'empty' });
  });
});
