import { act, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock(
  '../../../modules/dashboard/adapters/shared',
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import('../../../modules/dashboard/adapters/shared')
    >()),
    dashboardLogger: { error: vi.fn(), warn: vi.fn() },
  })
);

import { dashboardDefinitionSchema } from '../../../modules/dashboard/adapters/output/definition-sources/file-system/schemas';
import { dashboardLogger } from '../../../modules/dashboard/adapters/shared';
import {
  type DashboardDefinition,
  Period,
  type PivotTableSection as PivotTableSectionDefinition,
  type UrlState,
} from '../../../modules/dashboard/domain';
import sampleDashboard from '../../../modules/dashboard/fixtures/sample-dashboard.json';
import type { PivotCells } from '../../../modules/dashboard/use-cases';
import { DashboardSection } from '../DashboardSection';

const fixtureDashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const fixtureSection = (id: string) => {
  const section = fixtureDashboard.sections.find(
    (candidate) => candidate.id === id
  );
  if (section?.kind !== 'pivot-table')
    throw new Error('Expected pivot fixture');
  return section;
};
const selectedMonth = (key: string) => {
  const period = Period.parse('month', key);
  if (period === null) throw new Error('Expected selected month');
  return period;
};
const urlState: UrlState = {
  period: null,
  controls: {},
  pages: {},
  foreign: [],
};
const cellsIn = (name: string) => {
  const row = screen.getByRole('rowheader', { name }).closest('tr');
  if (row === null) throw new Error('Expected row for header');
  return within(row)
    .getAllByRole('cell')
    .map((cell) => cell.textContent);
};
const rowHeaders = () =>
  screen.getAllByRole('rowheader').map((header) => header.textContent);
const columnHeaders = () =>
  screen.getAllByRole('columnheader').map((header) => header.textContent);

async function mountPivot(
  dashboard: DashboardDefinition,
  section: PivotTableSectionDefinition,
  month: string,
  fetchPivotData: () => Promise<PivotCells | null>
) {
  const period = selectedMonth(month);
  const view = await DashboardSection({
    dashboard,
    section,
    urlState,
    periodResolution: Promise.resolve({
      period,
      bounds: { firstDate: period.firstDate, lastDate: period.lastDate },
      previousTarget: null,
      nextTarget: null,
    }),
    resolveSectionGate: async () => ({ status: 'open', period }),
    fetchSectionData: async () => null,
    fetchTableRows: async () => null,
    fetchBarsData: async () => null,
    fetchMatrixData: async () => null,
    fetchTimeSeriesPivot: async () => null,
    fetchPivotData,
  });
  render(view);
  await act(() => Promise.resolve());
}

function plainDashboard(section: PivotTableSectionDefinition) {
  return {
    id: 'summary',
    title: 'Summary',
    grain: 'month',
    timeZone: 'UTC',
    locale: 'en-US',
    revalidate: 86_400,
    defaultPeriod: 'latest-with-data',
    sections: [section],
  } satisfies DashboardDefinition;
}

describe('pivot table sections', () => {
  it('shows spine-filled month columns, totals, null labels, and measured zero', async () => {
    await mountPivot(
      fixtureDashboard,
      fixtureSection('category-pivot'),
      '2026-08',
      async () => ({
        exceeded: false,
        cells: [
          { row: 'food', column: '2026-08', value: 1200 },
          { row: 'food', column: '2026-07', value: 300 },
          { row: 'rent', column: '2026-08', value: 1500 },
          { row: null, column: '2026-06', value: 0 },
        ],
      })
    );

    expect(
      screen.getByRole('table', { name: 'Monthly amount by category' })
    ).toBeInTheDocument();
    expect(columnHeaders()).toEqual([
      'Category',
      '2025年9月',
      '2025年10月',
      '2025年11月',
      '2025年12月',
      '2026年1月',
      '2026年2月',
      '2026年3月',
      '2026年4月',
      '2026年5月',
      '2026年6月',
      '2026年7月',
      '2026年8月',
      'Total',
    ]);
    expect(rowHeaders()).toEqual([
      'food',
      'rent',
      'No category',
      'All categories',
    ]);
    expect(cellsIn('food')).toEqual([
      ...Array.from({ length: 10 }, () => '—'),
      '￥300',
      '￥1,200',
      '￥1,500',
    ]);
    expect(cellsIn('No category')).toEqual([
      ...Array.from({ length: 9 }, () => '—'),
      '￥0',
      '—',
      '—',
      '￥0',
    ]);
    expect(cellsIn('All categories')).toEqual([
      ...Array.from({ length: 9 }, () => '—'),
      '￥0',
      '￥300',
      '￥2,700',
      '￥3,000',
    ]);
  });

  it('folds rows after selecting top N and includes the remainder in totals', async () => {
    const section: PivotTableSectionDefinition = {
      id: 'pivot',
      title: 'Totals by category',
      kind: 'pivot-table',
      source: { dataset: 'metrics', view: 'entries', time: 'recorded_on' },
      rows: {
        column: 'category',
        label: 'Category',
        order: 'total-desc',
        topN: { count: 3, otherLabel: 'Other categories' },
      },
      columns: { axis: 'time', window: 3 },
      value: { column: 'amount', reduction: 'sum' },
      format: { type: 'number' },
      totals: { column: 'Total', row: 'Total' },
    };
    await mountPivot(plainDashboard(section), section, '2026-03', async () => ({
      exceeded: false,
      cells: [
        { row: 'rent', column: '2026-01', value: 20 },
        { row: 'b', column: '2026-01', value: 10 },
        { row: 'a', column: '2026-03', value: 10 },
        { row: 'fun', column: '2026-02', value: 7 },
      ],
    }));

    expect(columnHeaders()).toEqual([
      'Category',
      'January 2026',
      'February 2026',
      'March 2026',
      'Total',
    ]);
    expect(rowHeaders()).toEqual([
      'rent',
      'a',
      'b',
      'Other categories',
      'Total',
    ]);
    expect(cellsIn('Other categories')).toEqual(['—', '7', '—', '7']);
    expect(cellsIn('Total')).toEqual(['30', '7', '10', '47']);
  });

  it('sorts category columns and rows ascending with NULL last, without a footer', async () => {
    await mountPivot(
      fixtureDashboard,
      fixtureSection('category-by-weekday'),
      '2026-08',
      async () => ({
        exceeded: false,
        cells: [
          { row: 'reporting', column: 'Mon', value: 100 },
          { row: 'reporting', column: 'Tue', value: 25 },
          { row: 'operations', column: 'Mon', value: 50 },
          { row: 'operations', column: null, value: 5 },
          { row: null, column: 'Tue', value: 10 },
        ],
      })
    );

    expect(columnHeaders()).toEqual(['Category', 'Mon', 'Tue', 'No category']);
    expect(rowHeaders()).toEqual(['operations', 'reporting', 'No category']);
    expect(cellsIn('operations')).toEqual(['￥50', '—', '￥5']);
    expect(screen.getAllByRole('rowgroup')).toHaveLength(2);
    expect(screen.queryByRole('columnheader', { name: 'Total' })).toBeNull();
  });

  it('orders rows by their numeric sort key', async () => {
    const section: PivotTableSectionDefinition = {
      id: 'pivot',
      title: 'Weekday values',
      kind: 'pivot-table',
      source: { dataset: 'metrics', view: 'entries', time: 'recorded_on' },
      rows: {
        column: 'weekday_name',
        label: 'Weekday',
        order: { sortKey: { column: 'weekday_number', type: 'number' } },
      },
      columns: { axis: 'category', column: 'category' },
      value: { column: 'amount', reduction: 'sum' },
      format: { type: 'number' },
    };
    await mountPivot(plainDashboard(section), section, '2026-08', async () => ({
      exceeded: false,
      cells: [
        { row: 'Tue', column: 'food', value: 20, sortKey: 2 },
        { row: 'Mon', column: 'food', value: 10, sortKey: 1 },
        { row: null, column: 'food', value: 5, sortKey: null },
        { row: 'Mon', column: 'rent', value: 3, sortKey: 1 },
      ],
    }));

    expect(rowHeaders()).toEqual(['Mon', 'Tue', 'None']);
    expect(columnHeaders()).toEqual(['Weekday', 'food', 'rent']);
    expect(cellsIn('Mon')).toEqual(['10', '3']);
  });

  it.each([
    {
      name: 'a grid above the budget',
      rows: {
        column: 'category',
        label: 'Category',
        order: 'total-desc' as const,
      },
      columns: { axis: 'time' as const, window: 120 },
      data: {
        exceeded: false,
        cells: Array.from({ length: 17 }, (_, index) => ({
          row: `row-${index}`,
          column: '2026-08',
          value: 1,
        })),
      },
    },
    {
      name: 'a capped fetch',
      rows: fixtureSection('category-pivot').rows,
      columns: fixtureSection('category-pivot').columns,
      data: { exceeded: true, cells: [] },
    },
  ])('shows the budget message for $name', async ({ rows, columns, data }) => {
    const section = { ...fixtureSection('category-pivot'), rows, columns };
    await mountPivot(fixtureDashboard, section, '2026-08', async () => data);

    expect(
      screen.getByText(
        'Too many cells to show. Narrow the filters or shorten the window.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it.each([
    { count: 15, hasTable: true },
    { count: 16, hasTable: false },
  ])(
    'counts rows after top N at the $count-row boundary',
    async ({ count, hasTable }) => {
      const original = fixtureSection('category-pivot');
      const section: PivotTableSectionDefinition = {
        ...original,
        rows: {
          ...original.rows,
          topN: { count, otherLabel: 'Other categories' },
        },
        columns: { axis: 'time', window: 120 },
      };
      const cells = Array.from({ length: 100 }, (_, index) => ({
        row: `row-${String(index).padStart(3, '0')}`,
        column: '2026-08',
        value: 1,
      }));
      await mountPivot(fixtureDashboard, section, '2026-08', async () => ({
        exceeded: false,
        cells,
      }));

      if (hasTable) {
        expect(
          screen.getByRole('table', { name: 'Monthly amount by category' })
        ).toBeInTheDocument();
        expect(
          screen.getByRole('rowheader', { name: 'Other categories' })
        ).toBeInTheDocument();
      } else {
        expect(
          screen.getByText(
            'Too many cells to show. Narrow the filters or shorten the window.'
          )
        ).toBeInTheDocument();
        expect(screen.queryByRole('table')).toBeNull();
      }
    }
  );

  it('shows empty for no cells and unavailable for a fetch failure', async () => {
    const section = fixtureSection('category-pivot');
    await mountPivot(fixtureDashboard, section, '2026-08', async () => null);
    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  it('shows unavailable and logs a category column named like the row-heading column', async () => {
    vi.mocked(dashboardLogger.error).mockClear();
    const section = fixtureSection('category-by-weekday');
    await mountPivot(fixtureDashboard, section, '2026-08', async () => ({
      exceeded: false,
      cells: [{ row: 'reporting', column: section.rows.label, value: 1 }],
    }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(dashboardLogger.error).toHaveBeenCalled();
  });

  it('shows unavailable when the fetch fails', async () => {
    const section = fixtureSection('category-pivot');
    await mountPivot(fixtureDashboard, section, '2026-08', async () =>
      Promise.reject(new Error('driver failed'))
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it.each([
    {
      name: 'a row named like the remainder',
      totals: { column: 'Total', row: 'All categories' },
      rows: ['Other categories'],
    },
    {
      name: 'a row named like the totals row',
      totals: { column: 'Total', row: 'All categories' },
      rows: ['All categories'],
    },
    {
      name: 'a folded row named like the totals row',
      totals: { column: 'Total', row: 'All categories' },
      rows: ['a', 'b', 'c', 'd', 'e', 'f', 'All categories'],
    },
    {
      name: 'a totals column named like a month column',
      totals: { column: '2026年8月', row: 'All categories' },
      rows: ['food'],
    },
    {
      name: 'a totals column named like the row-heading column',
      totals: { column: 'Category', row: 'All categories' },
      rows: ['food'],
    },
  ])('shows unavailable and logs $name', async ({ totals, rows }) => {
    vi.mocked(dashboardLogger.error).mockClear();
    const section = { ...fixtureSection('category-pivot'), totals };
    await mountPivot(fixtureDashboard, section, '2026-08', async () => ({
      exceeded: false,
      cells: rows.map((row, index) => ({
        row,
        column: '2026-08',
        value: rows.length - index,
      })),
    }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(dashboardLogger.error).toHaveBeenCalled();
  });
});
