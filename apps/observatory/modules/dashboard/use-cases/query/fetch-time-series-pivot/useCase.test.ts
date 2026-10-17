import { describe, expect, it } from 'vitest';

import { dashboardDefinitionSchema } from '../../../adapters/output/definition-sources/file-system/schemas';
import { Period } from '../../../domain';
import sampleDashboard from '../../../fixtures/sample-dashboard.json';
import { FetchTimeSeriesPivot } from './useCase';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const section = dashboard.sections.find(
  (candidate) => candidate.id === 'category-series'
);
const period = Period.parse('month', '2026-08');
if (section?.kind !== 'time-series' || period === null) {
  throw new Error('Expected pivot fixture');
}

const buckets = {
  grouping: 'period-category' as const,
  truncated: false,
  buckets: [{ period: '2026-08', cells: [{ category: 'food', values: [10] }] }],
};

describe('FetchTimeSeriesPivot', () => {
  it('reads month-category buckets with the selected cache identity', async () => {
    const sut = new FetchTimeSeriesPivot({
      fetchGroupedValues: async (plan, options) =>
        plan.buckets?.grain === 'month' &&
        plan.dateRange.firstDate === '2025-09-01' &&
        plan.category?.column === 'category' &&
        options.revalidate === 86_400 &&
        options.name === 'dashboard-sample-dashboard-section-category-series'
          ? buckets
          : null,
    });

    expect(
      await sut.execute({ dashboard, section, period, selections: {} })
    ).toEqual(buckets);
  });

  it('applies an opted-in control before planning the pivot query', async () => {
    const controlled = { ...section, controls: ['category'] };
    const sut = new FetchTimeSeriesPivot({
      fetchGroupedValues: async (plan) => {
        const filter = plan.source.filters?.at(-1);
        return filter?.column === 'category' &&
          filter.operator === 'equals' &&
          filter.value === 'reporting'
          ? buckets
          : null;
      },
    });

    expect(
      await sut.execute({
        dashboard,
        section: controlled,
        period,
        selections: { category: 'reporting' },
      })
    ).toEqual(buckets);
  });

  it('rejects a grouped-values result without period and category keys', async () => {
    const sut = new FetchTimeSeriesPivot({
      fetchGroupedValues: async () => ({ grouping: 'category', groups: [] }),
    });

    await expect(
      sut.execute({ dashboard, section, period, selections: {} })
    ).rejects.toThrow('A time-series pivot reads period and category keys');
  });
});
