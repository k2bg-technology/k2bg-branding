import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { DataTable, type DataTableColumn, type DataTableRow } from '.';

const allocationColumns = [
  { id: 'assetClass', header: 'Asset class' },
  { id: 'value', header: 'Value', align: 'end' as const },
  { id: 'share', header: 'Share', align: 'end' as const },
];

const allocationRows = [
  {
    id: 'equities',
    cells: { assetClass: 'Equities', value: '¥7,488,000', share: '60.0%' },
  },
  {
    id: 'bonds',
    cells: { assetClass: 'Bonds', value: '¥2,496,000', share: '20.0%' },
  },
  {
    id: 'cash',
    cells: { assetClass: 'Cash', value: '¥1,872,000', share: '15.0%' },
  },
  {
    id: 'other',
    cells: { assetClass: 'Other', value: '¥624,000', share: '5.0%' },
  },
];

const monthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
];

const spendingCategories = [
  'Housing',
  'Food',
  'Transport',
  'Utilities',
  'Leisure',
];

/** Deterministic stand-in for sampled data, so every render is identical. */
function monthlyAmount(categoryIndex: number, monthIndex: number): number {
  return 40000 + categoryIndex * 18000 + monthIndex * 1300;
}

function formatYen(amount: number): string {
  return `¥${amount.toLocaleString('en-US')}`;
}

function rowTotal(categoryIndex: number): number {
  return monthLabels.reduce(
    (total, _, monthIndex) => total + monthlyAmount(categoryIndex, monthIndex),
    0
  );
}

function columnTotal(monthIndex: number): number {
  return spendingCategories.reduce(
    (total, _, categoryIndex) =>
      total + monthlyAmount(categoryIndex, monthIndex),
    0
  );
}

/** Cells for every month column, keyed by the month column ids. */
function monthCells(
  amountAt: (monthIndex: number) => number
): DataTableRow['cells'] {
  return monthLabels.reduce<DataTableRow['cells']>(
    (cells, month, monthIndex) => {
      cells[month.toLowerCase()] = formatYen(amountAt(monthIndex));
      return cells;
    },
    {}
  );
}

/** One label column plus eleven month columns: wider than any dashboard panel. */
const spendingColumns: DataTableColumn[] = [
  { id: 'category', header: 'Category' },
  ...monthLabels.map((month) => ({
    id: month.toLowerCase(),
    header: month,
    align: 'end' as const,
  })),
];

const spendingRows: DataTableRow[] = spendingCategories.map(
  (category, categoryIndex) => ({
    id: category.toLowerCase(),
    cells: {
      category,
      ...monthCells((monthIndex) => monthlyAmount(categoryIndex, monthIndex)),
    },
  })
);

const grandTotal = spendingCategories.reduce(
  (total, _, categoryIndex) => total + rowTotal(categoryIndex),
  0
);

const pivotColumns: DataTableColumn[] = [
  ...spendingColumns,
  { id: 'total', header: 'Total', align: 'end', emphasis: true },
];

const pivotRows: DataTableRow[] = spendingRows.map((row, categoryIndex) => ({
  ...row,
  cells: { ...row.cells, total: formatYen(rowTotal(categoryIndex)) },
}));

const pivotFooter: DataTableRow['cells'] = {
  category: 'Total',
  ...monthCells(columnTotal),
  total: formatYen(grandTotal),
};

/** A fixed-width host, so a wide table overflows at every viewport the tests run in. */
const narrowHost: Decorator = (Story) => (
  <div className="w-[640px]">
    <Story />
  </div>
);

/** Base UI's scroll area marks its viewport — the real scroll port — with this data id. */
function scrollPortOf(scrollRegion: HTMLElement): HTMLElement {
  const [viewport] = Array.from(
    scrollRegion.querySelectorAll<HTMLElement>('[data-id$="-viewport"]')
  );
  return viewport;
}

const meta = {
  component: DataTable,
  args: {
    caption: 'Allocation by asset class, August 2026',
    columns: allocationColumns,
    rows: allocationRows,
  },
  argTypes: {
    visuallyHiddenCaption: { control: 'boolean' },
    emptyMessage: { control: 'text' },
    stickyFirstColumn: { control: 'boolean' },
    footer: { control: 'object' },
  },
  parameters: {
    docs: {
      description: {
        component: 'components.dataTable.description',
      },
      overview: 'components.dataTable.overview',
      usage: 'components.dataTable.usage',
      accessibility: 'components.dataTable.accessibility',
      doList: 'components.dataTable.doList',
      dontList: 'components.dataTable.dontList',
      relatedComponents: 'components.dataTable.relatedComponents',
      dependencies: 'components.dataTable.dependencies',
      references: 'components.dataTable.references',
    },
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HiddenCaption: Story = {
  args: {
    visuallyHiddenCaption: true,
  },
};

export const TimeSeriesView: Story = {
  args: {
    caption: 'Room temperature over January 2026',
    columns: [
      { id: 'date', header: 'Date' },
      { id: 'livingRoom', header: 'Living room', align: 'end' },
      { id: 'bedroom', header: 'Bedroom', align: 'end' },
    ],
    rows: [
      {
        id: '1',
        cells: { date: '1/1', livingRoom: '19.8°C', bedroom: '18.2°C' },
      },
      {
        id: '3',
        cells: { date: '1/3', livingRoom: '20.4°C', bedroom: '18.6°C' },
      },
      {
        id: '5',
        cells: { date: '1/5', livingRoom: '21.1°C', bedroom: '19.3°C' },
      },
      { id: '7', cells: { date: '1/7', livingRoom: '—', bedroom: '18.9°C' } },
    ],
  },
};

export const Empty: Story = {
  args: {
    caption: 'Allocation by asset class, September 2026',
    rows: [],
    emptyMessage: 'No allocations recorded for this period',
  },
};

export const TwelveColumns: Story = {
  args: {
    caption: 'Spending by category, January to November 2026',
    columns: spendingColumns,
    rows: spendingRows,
  },
  decorators: [narrowHost],
  play: async ({ args, canvas }) => {
    const scrollRegion = canvas.getByRole('region', { name: args.caption });
    const scrollPort = scrollPortOf(scrollRegion);
    const [frame] = Array.from(
      scrollRegion.querySelectorAll<HTMLElement>('[data-slot="data-table"]')
    );

    await expect(scrollPort.scrollWidth).toBeGreaterThan(
      scrollPort.clientWidth
    );
    await expect(scrollPort.tabIndex).toBe(0);
    await expect(frame.offsetWidth).toBeLessThanOrEqual(
      scrollRegion.clientWidth
    );
  },
};

export const WithFooterTotals: Story = {
  args: {
    caption: 'Allocation by asset class with totals, August 2026',
    footer: { assetClass: 'Total', value: '¥12,480,000', share: '100.0%' },
  },
};

export const PivotLayout: Story = {
  args: {
    caption: 'Spending by category and month, January to November 2026',
    columns: pivotColumns,
    rows: pivotRows,
    footer: pivotFooter,
    stickyFirstColumn: true,
  },
  decorators: [narrowHost],
  play: async ({ args, canvas }) => {
    const scrollRegion = canvas.getByRole('region', { name: args.caption });
    const scrollPort = scrollPortOf(scrollRegion);
    const [firstRowHeader] = canvas.getAllByRole('rowheader');
    const restingLeft = firstRowHeader.getBoundingClientRect().left;

    scrollPort.scrollLeft = scrollPort.scrollWidth;

    await expect(scrollPort.scrollLeft).toBeGreaterThan(0);
    await expect(
      Math.abs(firstRowHeader.getBoundingClientRect().left - restingLeft)
    ).toBeLessThan(1);
    const captionOverhang =
      scrollPort.getBoundingClientRect().left -
      canvas.getByText(args.caption).getBoundingClientRect().left;

    await expect(captionOverhang).toBeLessThan(1);
  },
};
