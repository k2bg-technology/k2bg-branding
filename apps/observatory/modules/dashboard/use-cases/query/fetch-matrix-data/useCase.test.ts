import { describe, expect, it } from 'vitest';

import { dashboardDefinitionSchema } from '../../../adapters/output/definition-sources/file-system/schemas';
import { type MatrixQueryPlan, Period } from '../../../domain';
import sampleDashboard from '../../../fixtures/sample-dashboard.json';
import type { MatrixData } from '../../shared';
import { FetchMatrixData } from './useCase';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const period = Period.parse('month', '2026-08');
if (period === null) throw new Error('Expected fixture period');

function fixtureSection(id: string) {
  const section = dashboard.sections.find((candidate) => candidate.id === id);
  if (section?.kind !== 'matrix-heatmap')
    throw new Error(`Expected matrix fixture ${id}`);
  return section;
}

const data: MatrixData = {
  status: 'ready',
  rowCategories: ['food'],
  columnCategories: null,
  cells: [{ row: 'food', column: '2026-08-31', value: 10 }],
};

describe('FetchMatrixData', () => {
  it('queries the trailing window with the dashboard cache policy', async () => {
    const section = fixtureSection('daily-category-totals');
    const sut = new FetchMatrixData({
      fetchMatrixData: async (plan, options) =>
        plan.dateRange.firstDate === '2026-06-09' &&
        plan.dateRange.lastDate === '2026-08-31' &&
        plan.rows.axis === 'category' &&
        plan.rows.column === 'category' &&
        plan.columns.axis === 'date' &&
        plan.columns.length === 84 &&
        plan.cellLimit === 2000 &&
        options.revalidate === 86_400 &&
        options.name ===
          'dashboard-sample-dashboard-section-daily-category-totals'
          ? data
          : null,
    });

    const result = await sut.execute({
      dashboard,
      section,
      period,
      selections: {},
    });

    expect(result).toEqual(data);
  });

  it('appends the selected control filter to the section source', async () => {
    const section = {
      ...fixtureSection('hourly-readings'),
      controls: ['category'],
    };
    const sut = new FetchMatrixData({
      fetchMatrixData: async (plan: MatrixQueryPlan) =>
        JSON.stringify(plan.source.filters) ===
        JSON.stringify([
          { column: 'category', operator: 'equals', value: 'reporting' },
        ])
          ? data
          : null,
    });

    const result = await sut.execute({
      dashboard,
      section,
      period,
      selections: { category: 'reporting' },
    });

    expect(result).toEqual(data);
  });

  it('returns too large without querying when the date and hour axes exceed the budget', async () => {
    const section = { ...fixtureSection('hourly-readings'), window: 84 };
    const sut = new FetchMatrixData({
      fetchMatrixData: async () => {
        throw new Error('must not query');
      },
    });

    const result = await sut.execute({
      dashboard,
      section,
      period,
      selections: {},
    });

    expect(result).toEqual({ status: 'too-large' });
  });

  it('queries an hour by date grid that fits the budget', async () => {
    const section = { ...fixtureSection('hourly-readings'), window: 83 };
    const sut = new FetchMatrixData({
      fetchMatrixData: async (plan) =>
        plan.columns.axis === 'date' && plan.columns.length === 83
          ? data
          : null,
    });

    const result = await sut.execute({
      dashboard,
      section,
      period,
      selections: {},
    });

    expect(result).toEqual(data);
  });
});
