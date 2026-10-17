import { describe, expect, it } from 'vitest';

import { dashboardDefinitionSchema } from '../../adapters/output/definition-sources/file-system/schemas';
import sampleDashboard from '../../fixtures/sample-dashboard.json';
import { Period } from '../period';
import {
  planDonutCenter,
  planDonutParts,
  planTreemapParts,
} from './composition';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const period = Period.parse('month', '2026-08');
if (period === null) throw new Error('Expected fixture period');
const donut = (id: string) => {
  const section = dashboard.sections.find((candidate) => candidate.id === id);
  if (section?.kind !== 'donut') throw new Error('Expected donut fixture');
  return section;
};
const treemap = () => {
  const section = dashboard.sections.find(
    (candidate) => candidate.id === 'category-tree'
  );
  if (section?.kind !== 'treemap') throw new Error('Expected treemap fixture');
  return section;
};

describe('composition query plans', () => {
  it('plans sorted donut parts for the selected period', () => {
    const section = donut('weekday-share');

    const result = planDonutParts(section, period, dashboard.timeZone);

    expect(result).toEqual({
      sectionId: 'weekday-share',
      source: section.source,
      timeZone: 'Asia/Tokyo',
      dateRange: { firstDate: '2026-08-01', lastDate: '2026-08-31' },
      measures: [{ column: 'amount', reduction: 'sum', transform: 'absolute' }],
      buckets: null,
      category: {
        column: 'weekday_name',
        sortKey: { column: 'weekday_number', type: 'number' },
      },
    });
    expect(
      planDonutParts(donut('spending-share'), period, dashboard.timeZone)
        .category
    ).toEqual({ column: 'category', sortKey: null });
  });

  it('plans a latest non-null centre value in the selected period', () => {
    const section = donut('weekday-share');

    const result = planDonutCenter(section, period, dashboard.timeZone);

    expect(result).toEqual({
      kind: 'stat-tiles',
      sectionId: 'weekday-share',
      grain: 'month',
      source: {
        ...section.source,
        filters: [{ column: 'running_balance', operator: 'is-not-null' }],
      },
      timeZone: 'Asia/Tokyo',
      selectedPeriod: '2026-08',
      dateRange: { firstDate: '2026-08-01', lastDate: '2026-08-31' },
      measures: [
        { column: 'running_balance', reduction: 'latest', compares: false },
      ],
    });
    expect(
      planDonutCenter(donut('spending-share'), period, dashboard.timeZone)
    ).toBeNull();
  });

  it('plans grouped treemap parts for the selected period', () => {
    const section = treemap();

    const result = planTreemapParts(section, period, dashboard.timeZone);

    expect(result).toEqual({
      sectionId: 'category-tree',
      source: section.source,
      timeZone: 'Asia/Tokyo',
      dateRange: { firstDate: '2026-08-01', lastDate: '2026-08-31' },
      measure: { column: 'amount', transform: 'absolute' },
      group: 'category_group',
      category: 'category',
    });
  });
});
