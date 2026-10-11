import { describe, expect, it } from 'vitest';
import { dashboardDefinitionSchema } from '../../adapters/output/definition-sources/file-system/schemas';
import sampleDashboard from '../../fixtures/sample-dashboard.json';
import { Period } from '../period';
import { planPivotTableSection } from './pivotTable';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const period = Period.parse('month', '2026-08');
if (period === null) throw new Error('Expected fixture period');
const fixtureSection = (id: string) => {
  const section = dashboard.sections.find((candidate) => candidate.id === id);
  if (section?.kind !== 'pivot-table')
    throw new Error('Expected pivot fixture');
  return section;
};

describe('planPivotTableSection', () => {
  it('covers the trailing time window', () => {
    const section = fixtureSection('category-pivot');
    const sut = planPivotTableSection(section, period, dashboard.timeZone);

    expect(sut).toEqual({
      sectionId: 'category-pivot',
      source: section.source,
      timeZone: 'Asia/Tokyo',
      dateRange: { firstDate: '2025-09-01', lastDate: '2026-08-31' },
      rowKey: { column: 'category', sortKey: null },
      columnKey: { kind: 'period', grain: 'month' },
      measure: { column: 'amount', reduction: 'sum', transform: 'absolute' },
      cellLimit: 10_000,
    });
  });

  it('covers the selected period on a category axis', () => {
    const section = fixtureSection('category-by-weekday');
    const sut = planPivotTableSection(section, period, dashboard.timeZone);

    expect(sut).toEqual({
      sectionId: 'category-by-weekday',
      source: section.source,
      timeZone: 'Asia/Tokyo',
      dateRange: { firstDate: '2026-08-01', lastDate: '2026-08-31' },
      rowKey: { column: 'category', sortKey: null },
      columnKey: { kind: 'category', column: 'weekday_name' },
      measure: { column: 'amount', reduction: 'average', transform: undefined },
      cellLimit: 10_000,
    });
  });

  it('covers finer daily columns without a window', () => {
    const section = fixtureSection('category-pivot');
    const sut = planPivotTableSection(
      { ...section, columns: { axis: 'time', grain: 'day' } },
      period,
      dashboard.timeZone
    );

    expect(sut.dateRange).toEqual({
      firstDate: '2026-08-01',
      lastDate: '2026-08-31',
    });
    expect(sut.columnKey).toEqual({ kind: 'period', grain: 'day' });
  });

  it('plans a row sort key', () => {
    const section = fixtureSection('category-by-weekday');
    const sut = planPivotTableSection(
      {
        ...section,
        rows: {
          ...section.rows,
          order: { sortKey: { column: 'weekday_number', type: 'number' } },
        },
      },
      period,
      dashboard.timeZone
    );

    expect(sut.rowKey.sortKey).toEqual({
      column: 'weekday_number',
      type: 'number',
    });
  });
});
