import { describe, expect, it } from 'vitest';

import { dashboardDefinitionSchema } from '../../../adapters/output/definition-sources/file-system/schemas';
import type {
  GroupedValuesPlan,
  SectionQueryPlan,
  TimeSeriesSection,
} from '../../../domain';
import sampleDashboard from '../../../fixtures/sample-dashboard.json';
import type { QueryOptions } from '../../shared';
import { FetchRebaseBase } from './useCase';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const section = dashboard.sections.find(
  (candidate) => candidate.id === 'rebased-balances'
);
if (section?.kind !== 'time-series')
  throw new Error('Expected rebased fixture');

describe('FetchRebaseBase', () => {
  it('reads the wide base bucket with the dashboard cache policy', async () => {
    const sut = new FetchRebaseBase(
      {
        fetchSectionData: async (
          plan: SectionQueryPlan,
          options: QueryOptions
        ) =>
          plan.kind === 'stat-tiles' &&
          plan.selectedPeriod === '2026-01' &&
          plan.dateRange.firstDate === '2026-01-01' &&
          plan.dateRange.lastDate === '2026-01-31' &&
          options.name ===
            'dashboard-sample-dashboard-section-rebased-balances-rebase-base' &&
          options.revalidate === 86_400
            ? {
                buckets: [{ period: '2026-01', values: [80, 40] }],
                truncated: false,
              }
            : null,
      },
      { fetchGroupedValues: async () => null }
    );

    const result = await sut.execute({ dashboard, section, selections: {} });

    expect(result).toEqual({ layout: 'wide', values: [80, 40] });
  });

  it('returns no base when the base bucket has no rows', async () => {
    const sut = new FetchRebaseBase(
      { fetchSectionData: async () => null },
      { fetchGroupedValues: async () => null }
    );

    const result = await sut.execute({ dashboard, section, selections: {} });

    expect(result).toBeNull();
  });

  it('reads the pivot base date with selected control filters', async () => {
    const pivotSection: TimeSeriesSection = {
      ...section,
      grain: 'day',
      series: undefined,
      controls: ['category'],
      pivot: {
        column: 'category',
        value: { column: 'amount', reduction: 'sum' },
        normalize: { kind: 'rebase', base: { date: '2026-01-15' } },
      },
    };
    const sut = new FetchRebaseBase(
      { fetchSectionData: async () => null },
      {
        fetchGroupedValues: async (plan: GroupedValuesPlan) =>
          plan.buckets?.bucketLimit === 1 &&
          plan.buckets.grain === 'day' &&
          plan.dateRange.firstDate === '2026-01-15' &&
          plan.category?.column === 'category' &&
          JSON.stringify(plan.source.filters?.at(-1)) ===
            JSON.stringify({
              column: 'category',
              operator: 'equals',
              value: 'reporting',
            })
            ? {
                grouping: 'period-category',
                truncated: false,
                buckets: [
                  {
                    period: '2026-01-15',
                    cells: [{ category: 'rent', values: [50] }],
                  },
                ],
              }
            : null,
      }
    );

    const result = await sut.execute({
      dashboard: {
        ...dashboard,
        controls: [
          {
            id: 'category',
            label: 'Category',
            column: 'category',
            options: ['reporting'],
          },
        ],
      },
      section: pivotSection,
      selections: { category: 'reporting' },
    });

    expect(result).toEqual({
      layout: 'pivot',
      bucket: {
        period: '2026-01-15',
        cells: [{ category: 'rent', values: [50] }],
      },
    });
  });

  it('rejects a pivot base without period and category keys', async () => {
    const pivotSection: TimeSeriesSection = {
      ...section,
      series: undefined,
      pivot: {
        column: 'category',
        value: { column: 'amount', reduction: 'sum' },
        normalize: { kind: 'rebase', base: { date: '2026-01-15' } },
      },
    };
    const sut = new FetchRebaseBase(
      { fetchSectionData: async () => null },
      { fetchGroupedValues: async () => ({ grouping: 'category', groups: [] }) }
    );

    await expect(
      sut.execute({ dashboard, section: pivotSection, selections: {} })
    ).rejects.toThrow('A pivot base reads period and category keys');
  });
});
