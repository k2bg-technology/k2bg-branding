import { describe, expect, it } from 'vitest';
import { dashboardDefinitionSchema } from '../../adapters/output/definition-sources/file-system/schemas';
import sampleDashboard from '../../fixtures/sample-dashboard.json';
import { Period } from '../period';
import { planBarsSection } from './bars';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const period = Period.parse('month', '2026-08');
if (period === null) throw new Error('Expected fixture period');
const bars = (id: string) => {
  const section = dashboard.sections.find((candidate) => candidate.id === id);
  if (section?.kind !== 'bars') throw new Error('Expected bars fixture');
  return section;
};

describe('planBarsSection', () => {
  it('covers trailing time buckets and a pivot category', () => {
    expect(
      planBarsSection(bars('category-trend'), period, dashboard.timeZone)
    ).toMatchObject({
      dateRange: { firstDate: '2025-09-01', lastDate: '2026-08-31' },
      buckets: { grain: 'month', bucketLimit: 120 },
      category: { column: 'category', sortKey: null },
      measures: [{ column: 'amount', reduction: 'sum', transform: 'absolute' }],
    });
  });
  it('covers every day of the selected month without a window', () => {
    const sut = planBarsSection;

    const result = sut(bars('daily-totals'), period, dashboard.timeZone);

    expect(result).toMatchObject({
      dateRange: { firstDate: '2026-08-01', lastDate: '2026-08-31' },
      buckets: { grain: 'day', bucketLimit: 120 },
      category: null,
      measures: [{ column: 'amount', reduction: 'sum', transform: 'absolute' }],
    });
  });

  it('covers trailing days ending at the selected month end', () => {
    const section = {
      ...bars('daily-totals'),
      x: { axis: 'time' as const, grain: 'day' as const, window: 7 },
    };
    const sut = planBarsSection;

    const result = sut(section, period, dashboard.timeZone);

    expect(result.dateRange).toEqual({
      firstDate: '2026-08-25',
      lastDate: '2026-08-31',
    });
  });

  it('covers only the selected period for a category axis', () => {
    expect(
      planBarsSection(bars('category-ranking'), period, dashboard.timeZone)
    ).toMatchObject({
      dateRange: { firstDate: '2026-08-01', lastDate: '2026-08-31' },
      buckets: null,
      category: { column: 'category', sortKey: null },
    });
    expect(
      planBarsSection(bars('weekday-totals'), period, dashboard.timeZone)
        .category
    ).toEqual({
      column: 'weekday_name',
      sortKey: { column: 'weekday_number', type: 'number' },
    });
  });
  it('fails a section with no value binding', () => {
    expect(() =>
      planBarsSection(
        { ...bars('category-trend'), pivot: undefined, series: undefined },
        period,
        dashboard.timeZone
      )
    ).toThrow('A bars section requires series or pivot');
  });
});
