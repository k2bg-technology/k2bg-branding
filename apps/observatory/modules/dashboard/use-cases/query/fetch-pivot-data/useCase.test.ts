import { describe, expect, it } from 'vitest';
import { dashboardDefinitionSchema } from '../../../adapters/output/definition-sources/file-system/schemas';
import { Period } from '../../../domain';
import sampleDashboard from '../../../fixtures/sample-dashboard.json';
import { FetchPivotData } from './useCase';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const section = dashboard.sections.find(
  (candidate) => candidate.id === 'category-by-weekday'
);
if (section?.kind !== 'pivot-table') throw new Error('Expected pivot fixture');
const period = Period.parse('month', '2026-08');
if (period === null) throw new Error('Expected fixture period');

describe('FetchPivotData', () => {
  it('passes selected controls, period, and cache options to the query service', async () => {
    const expected = {
      cells: [{ row: 'reporting', column: 'Mon', value: 10 }],
      exceeded: false,
    };
    const sut = new FetchPivotData({
      fetchPivotCells: async (plan, options) => {
        if (
          plan.source.filters?.some(
            (filter) =>
              'value' in filter &&
              filter.column === 'category' &&
              filter.operator === 'equals' &&
              filter.value === 'reporting'
          ) &&
          plan.dateRange.firstDate === '2026-08-01' &&
          plan.columnKey.kind === 'category' &&
          options.name ===
            'dashboard-sample-dashboard-section-category-by-weekday' &&
          options.revalidate === 86_400
        )
          return expected;
        return null;
      },
    });

    const result = await sut.execute({
      dashboard,
      section,
      period,
      selections: { category: 'reporting' },
    });

    expect(result).toEqual(expected);
  });
});
