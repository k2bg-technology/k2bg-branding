import { describe, expect, it } from 'vitest';
import { dashboardDefinitionSchema } from '../../adapters/output/definition-sources/file-system/schemas';
import sampleDashboard from '../../fixtures/sample-dashboard.json';
import { Period } from '../period';
import { planScatterPoints, planScatterTrend } from './scatter';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const period = Period.parse('month', '2026-08');
if (period === null) throw new Error('Expected fixture period');
const section = (id: string) => {
  const found = dashboard.sections.find((candidate) => candidate.id === id);
  if (found?.kind !== 'scatter') throw new Error('Expected scatter fixture');
  return found;
};

describe('scatter query plans', () => {
  it('plans the points of the selected period', () => {
    const selected = section('balance-by-amount');
    expect(planScatterPoints(selected, period, 'Asia/Tokyo')).toEqual({
      sectionId: 'balance-by-amount',
      source: selected.source,
      timeZone: 'Asia/Tokyo',
      dateRange: { firstDate: '2026-08-01', lastDate: '2026-08-31' },
      x: 'amount',
      y: 'running_balance',
      series: 'category',
      limit: 200,
    });
    expect(
      planScatterPoints(section('reading-correlation'), period, 'Asia/Tokyo')
        .series
    ).toBeNull();
  });

  it('plans the latest row where both coefficients are present', () => {
    const selected = section('balance-by-amount');
    expect(planScatterTrend(selected, period, 'Asia/Tokyo')).toEqual({
      kind: 'stat-tiles',
      sectionId: 'balance-by-amount',
      grain: 'month',
      source: {
        ...selected.source,
        filters: [
          { column: 'balance_slope', operator: 'is-not-null' },
          { column: 'balance_intercept', operator: 'is-not-null' },
        ],
      },
      timeZone: 'Asia/Tokyo',
      selectedPeriod: '2026-08',
      dateRange: { firstDate: '2026-08-01', lastDate: '2026-08-31' },
      measures: [
        { column: 'balance_slope', reduction: 'latest', compares: false },
        { column: 'balance_intercept', reduction: 'latest', compares: false },
      ],
    });
    expect(
      planScatterTrend(section('reading-correlation'), period, 'Asia/Tokyo')
    ).toBeNull();
  });
});
