import { describe, expect, it } from 'vitest';

import { dashboardDefinitionSchema } from '../../../adapters/output/definition-sources/file-system/schemas';
import { Period } from '../../../domain';
import sampleDashboard from '../../../fixtures/sample-dashboard.json';
import { FetchScatterData } from './useCase';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const period = Period.parse('month', '2026-08');
if (period === null) throw new Error('Expected fixture period');
const section = (id: string) => {
  const found = dashboard.sections.find((candidate) => candidate.id === id);
  if (found?.kind !== 'scatter') throw new Error('Expected scatter fixture');
  return found;
};
const controlFilter = [
  { column: 'category', operator: 'equals', value: 'reporting' },
];
const selections = { category: 'reporting' };
const points = {
  points: [{ x: 1200, y: 9800, series: 'reporting' }],
  truncated: false,
};
const pointsService = {
  fetchScatterPoints: async (
    plan: Parameters<
      ConstructorParameters<typeof FetchScatterData>[0]['fetchScatterPoints']
    >[0],
    options: Parameters<
      ConstructorParameters<typeof FetchScatterData>[0]['fetchScatterPoints']
    >[1]
  ) =>
    JSON.stringify(plan.source.filters) === JSON.stringify(controlFilter) &&
    plan.x === 'amount' &&
    plan.y === 'running_balance' &&
    plan.series === 'category' &&
    plan.limit === 200 &&
    options.name === 'dashboard-sample-dashboard-section-balance-by-amount' &&
    options.revalidate === 86_400
      ? points
      : null,
};

describe('FetchScatterData', () => {
  it('applies the control selection to the points and trend queries', async () => {
    const sut = new FetchScatterData(pointsService, {
      fetchSectionData: async (plan, options) =>
        plan.kind === 'stat-tiles' &&
        JSON.stringify(plan.source.filters) ===
          JSON.stringify([
            ...controlFilter,
            { column: 'balance_slope', operator: 'is-not-null' },
            { column: 'balance_intercept', operator: 'is-not-null' },
          ]) &&
        JSON.stringify(plan.measures) ===
          JSON.stringify([
            { column: 'balance_slope', reduction: 'latest', compares: false },
            {
              column: 'balance_intercept',
              reduction: 'latest',
              compares: false,
            },
          ]) &&
        options.name ===
          'dashboard-sample-dashboard-section-balance-by-amount-trend'
          ? {
              buckets: [{ period: '2026-08', values: [1.25, -300] }],
              truncated: false,
            }
          : null,
    });
    expect(
      await sut.execute({
        dashboard,
        section: section('balance-by-amount'),
        period,
        selections,
      })
    ).toEqual({ ...points, trendLine: { slope: 1.25, intercept: -300 } });
  });

  it('draws no trend line when the period has no coefficient row', async () => {
    const sut = new FetchScatterData(pointsService, {
      fetchSectionData: async () => null,
    });
    expect(
      await sut.execute({
        dashboard,
        section: section('balance-by-amount'),
        period,
        selections,
      })
    ).toEqual({ ...points, trendLine: null });
  });

  it('returns null when there are no points', async () => {
    const sut = new FetchScatterData(
      { fetchScatterPoints: async () => null },
      {
        fetchSectionData: async () => ({
          buckets: [{ period: '2026-08', values: [1.25, -300] }],
          truncated: false,
        }),
      }
    );
    expect(
      await sut.execute({
        dashboard,
        section: section('balance-by-amount'),
        period,
        selections,
      })
    ).toBeNull();
  });

  it('returns no trend line for a section without coefficient columns', async () => {
    const result = { points: [{ x: 21.5, y: 55 }], truncated: true };
    const sut = new FetchScatterData(
      { fetchScatterPoints: async () => result },
      { fetchSectionData: async () => null }
    );
    expect(
      await sut.execute({
        dashboard,
        section: section('reading-correlation'),
        period,
        selections: {},
      })
    ).toEqual({ ...result, trendLine: null });
  });
});
