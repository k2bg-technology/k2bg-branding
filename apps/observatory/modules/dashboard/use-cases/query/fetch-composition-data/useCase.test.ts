import { describe, expect, it } from 'vitest';

import { dashboardDefinitionSchema } from '../../../adapters/output/definition-sources/file-system/schemas';
import { Period } from '../../../domain';
import sampleDashboard from '../../../fixtures/sample-dashboard.json';
import { FetchCompositionData } from './useCase';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const period = Period.parse('month', '2026-08');
if (period === null) throw new Error('Expected fixture period');
const section = (id: string) => {
  const found = dashboard.sections.find((candidate) => candidate.id === id);
  if (found?.kind !== 'donut' && found?.kind !== 'treemap') {
    throw new Error('Expected composition fixture');
  }
  return { ...found, controls: ['category'] };
};
const controlFilter = [
  { column: 'category', operator: 'equals', value: 'reporting' },
];
const selections = { category: 'reporting' };

describe('FetchCompositionData', () => {
  it('applies the control selection to the parts and centre queries of a donut', async () => {
    const sut = new FetchCompositionData(
      {
        fetchGroupedValues: async (plan, options) =>
          JSON.stringify(plan.source.filters) ===
            JSON.stringify(controlFilter) &&
          plan.buckets === null &&
          plan.category?.sortKey?.column === 'weekday_number' &&
          options.name === 'dashboard-sample-dashboard-section-weekday-share' &&
          options.revalidate === 86_400
            ? {
                grouping: 'category',
                groups: [{ category: 'Mon', values: [100], sortKey: 1 }],
              }
            : null,
      },
      { fetchTreemapParts: async () => null },
      {
        fetchSectionData: async (plan, options) =>
          plan.kind === 'stat-tiles' &&
          JSON.stringify(plan.source.filters) ===
            JSON.stringify([
              ...controlFilter,
              { column: 'running_balance', operator: 'is-not-null' },
            ]) &&
          JSON.stringify(plan.measures) ===
            JSON.stringify([
              {
                column: 'running_balance',
                reduction: 'latest',
                compares: false,
              },
            ]) &&
          options.name ===
            'dashboard-sample-dashboard-section-weekday-share-center'
            ? {
                buckets: [{ period: '2026-08', values: [9800] }],
                truncated: false,
              }
            : null,
      }
    );
    const donut = section('weekday-share');
    if (donut.kind !== 'donut') throw new Error('Expected donut');

    const result = await sut.execute({
      dashboard,
      section: donut,
      period,
      selections,
    });

    expect(result).toEqual({
      parts: [{ category: 'Mon', value: 100, sortKey: 1 }],
      center: 9800,
    });
  });

  it('returns a null centre when the period has no centre value', async () => {
    const sut = new FetchCompositionData(
      {
        fetchGroupedValues: async () => ({
          grouping: 'category',
          groups: [{ category: 'Mon', values: [100], sortKey: 1 }],
        }),
      },
      { fetchTreemapParts: async () => null },
      { fetchSectionData: async () => null }
    );
    const donut = section('weekday-share');
    if (donut.kind !== 'donut') throw new Error('Expected donut');

    const result = await sut.execute({
      dashboard,
      section: donut,
      period,
      selections,
    });

    expect(result).toEqual({
      parts: [{ category: 'Mon', value: 100, sortKey: 1 }],
      center: null,
    });
  });

  it('applies the control selection to a treemap', async () => {
    const parts = [{ group: 'Home', category: 'Rent', value: 600 }];
    const sut = new FetchCompositionData(
      { fetchGroupedValues: async () => null },
      {
        fetchTreemapParts: async (plan, options) =>
          plan.group === 'category_group' &&
          plan.category === 'category' &&
          JSON.stringify(plan.source.filters) ===
            JSON.stringify(controlFilter) &&
          options.name === 'dashboard-sample-dashboard-section-category-tree'
            ? parts
            : null,
      },
      { fetchSectionData: async () => null }
    );
    const treemap = section('category-tree');
    if (treemap.kind !== 'treemap') throw new Error('Expected treemap');

    const result = await sut.execute({
      dashboard,
      section: treemap,
      period,
      selections,
    });

    expect(result).toEqual({ parts, center: null });
  });

  it('returns null for a donut with no rows', async () => {
    const sut = new FetchCompositionData(
      { fetchGroupedValues: async () => null },
      { fetchTreemapParts: async () => null },
      { fetchSectionData: async () => null }
    );
    const donut = section('spending-share');
    if (donut.kind !== 'donut') throw new Error('Expected donut');

    const result = await sut.execute({
      dashboard,
      section: donut,
      period,
      selections,
    });

    expect(result).toBeNull();
  });
});
