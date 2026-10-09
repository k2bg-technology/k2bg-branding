import { describe, expect, it } from 'vitest';

import type { DashboardDefinition, SectionQueryPlan } from '../../../domain';
import { Period } from '../../../domain';
import { FetchSectionData } from './useCase';

function createDashboard(): DashboardDefinition {
  return {
    id: 'summary',
    title: 'Summary',
    grain: 'month',
    timeZone: 'Asia/Tokyo',
    locale: 'en-US',
    revalidate: 3_600,
    defaultPeriod: 'latest-with-data',
    sections: [
      {
        id: 'headline',
        title: 'Headline',
        kind: 'stat-tiles',
        source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
        tiles: [
          {
            label: 'Total',
            column: 'total',
            reduction: 'maximum',
            format: { type: 'number' },
          },
        ],
      },
    ],
  };
}

describe('FetchSectionData', () => {
  it('plans the selected month and applies the dashboard revalidation window', async () => {
    const dashboard = createDashboard();
    const period = Period.parse('month', '2026-09');
    if (period === null) {
      throw new Error('Expected fixture period to parse');
    }
    const queryService = {
      fetchSectionData: async (
        plan: SectionQueryPlan,
        options: { name: string; revalidate: number }
      ) =>
        plan.dateRange.firstDate === '2026-09-01' &&
        plan.dateRange.lastDate === '2026-09-30' &&
        plan.measures[0]?.reduction === 'maximum' &&
        options.revalidate === 3_600
          ? { buckets: [{ period: '2026-09', values: [42] }], truncated: false }
          : null,
    };
    const section = dashboard.sections[0];
    if (section.kind !== 'stat-tiles') {
      throw new Error('Expected stat-tiles fixture');
    }
    const sut = new FetchSectionData(queryService);

    const result = await sut.execute({
      dashboard,
      section,
      period,
      selections: {},
    });

    expect(result).toEqual({
      buckets: [{ period: '2026-09', values: [42] }],
      truncated: false,
    });
  });

  it('plans selected control filters for a section', async () => {
    const dashboard = createDashboard();
    dashboard.controls = [
      {
        id: 'category',
        label: 'Category',
        column: 'category',
        options: ['food'],
      },
    ];
    const section = dashboard.sections[0];
    if (section.kind !== 'stat-tiles') {
      throw new Error('Expected stat-tiles fixture');
    }
    section.controls = ['category'];
    const period = Period.parse('month', '2026-09');
    if (period === null) {
      throw new Error('Expected fixture period to parse');
    }
    const buckets = [{ period: '2026-09', values: [42] }];
    const queryService = {
      fetchSectionData: async (plan: SectionQueryPlan) =>
        JSON.stringify(plan.source.filters) ===
        JSON.stringify([
          { column: 'category', operator: 'equals', value: 'food' },
        ])
          ? { buckets, truncated: false }
          : null,
    };
    const sut = new FetchSectionData(queryService);

    const result = await sut.execute({
      dashboard,
      section,
      period,
      selections: { category: 'food' },
    });

    expect(result?.buckets).toEqual(buckets);
  });
});
