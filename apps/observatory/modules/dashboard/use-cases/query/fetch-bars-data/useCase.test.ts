import { describe, expect, it } from 'vitest';
import { dashboardDefinitionSchema } from '../../../adapters/output/definition-sources/file-system/schemas';
import { type GroupedValuesPlan, Period } from '../../../domain';
import sampleDashboard from '../../../fixtures/sample-dashboard.json';
import { FetchBarsData } from './useCase';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const section = dashboard.sections.find(
  (candidate) => candidate.id === 'category-trend'
);
const period = Period.parse('month', '2026-08');
if (section?.kind !== 'bars' || period === null)
  throw new Error('Expected bars fixture');

describe('FetchBarsData', () => {
  it('queries the trailing pivot window with the dashboard cache policy', async () => {
    const data = {
      grouping: 'period-category' as const,
      buckets: [
        { period: '2026-08', cells: [{ category: 'food', values: [3] }] },
      ],
      truncated: false,
    };
    const sut = new FetchBarsData({
      fetchGroupedValues: async (plan: GroupedValuesPlan, options) =>
        plan.dateRange.firstDate === '2025-09-01' &&
        plan.dateRange.lastDate === '2026-08-31' &&
        plan.category?.column === 'category' &&
        options.revalidate === 86_400 &&
        options.name === 'dashboard-sample-dashboard-section-category-trend'
          ? data
          : null,
    });

    expect(await sut.execute({ dashboard, section, period })).toEqual(data);
  });
});
