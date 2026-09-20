import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import { TreemapChart, type TreemapChartNode } from '.';

const thousandYen = (value: number) => `¥${value.toLocaleString('en-US')}k`;

const everydayCategories = [
  'Rent',
  'Groceries',
  'Dining out',
  'Electricity',
  'Mobile',
  'Internet',
  'Transport',
  'Insurance',
  'Medical',
  'Clothing',
  'Books',
  'Music',
  'Streaming',
  'Hobbies',
  'Gifts',
  'Haircut',
  'Laundry',
  'Stationery',
  'Coffee',
  'Snacks',
  'Batteries',
  'Cables',
  'Plants',
  'Postage',
  'Repairs',
  'Cleaning',
  'Tea',
  'Socks',
  'Notebooks',
  'Stamps',
];

/** A steady decay gives the long tail a treemap is meant to make readable. */
const longTailNodes: TreemapChartNode[] = everydayCategories.map(
  (label, index) => ({
    id: label.toLowerCase().replace(/\s+/g, '-'),
    label,
    value: Math.round(420 * 0.82 ** index) + 2,
  })
);

const groupedNodes: TreemapChartNode[] = [
  { id: 'rent', label: 'Rent', value: 420, group: 'Home' },
  { id: 'electricity', label: 'Electricity', value: 96, group: 'Home' },
  { id: 'internet', label: 'Internet', value: 58, group: 'Home' },
  { id: 'groceries', label: 'Groceries', value: 310, group: 'Daily' },
  { id: 'diningOut', label: 'Dining out', value: 140, group: 'Daily' },
  { id: 'coffee', label: 'Coffee', value: 36, group: 'Daily' },
  { id: 'trains', label: 'Trains', value: 124, group: 'Transport' },
  { id: 'taxis', label: 'Taxis', value: 28, group: 'Transport' },
  { id: 'books', label: 'Books', value: 88, group: 'Learning' },
  { id: 'courses', label: 'Courses', value: 64, group: 'Learning' },
  { id: 'insurance', label: 'Insurance', value: 72, group: 'Reserves' },
  {
    id: 'emergencyFund',
    label: 'Emergency fund',
    value: 150,
    group: 'Reserves',
  },
];

const meta = {
  component: TreemapChart,
  args: {
    label: 'Where a year of everyday spending went',
    nodes: longTailNodes,
    valueFormatter: thousandYen,
  },
  argTypes: {
    colorBy: {
      control: 'inline-radio',
      options: ['group', 'value'],
    },
    height: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'components.treemapChart.description',
      },
      overview: 'components.treemapChart.overview',
      usage: 'components.treemapChart.usage',
      accessibility: 'components.treemapChart.accessibility',
      doList: 'components.treemapChart.doList',
      dontList: 'components.treemapChart.dontList',
      relatedComponents: 'components.treemapChart.relatedComponents',
      dependencies: 'components.treemapChart.dependencies',
      references: 'components.treemapChart.references',
    },
  },
} satisfies Meta<typeof TreemapChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Flat: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const tooltip = () =>
      canvasElement.querySelector('[data-slot="chart-tooltip"]');
    // Read after every await: the tiles remount whenever the chart is resized.
    const tiles = () =>
      Array.from(
        canvasElement.querySelectorAll('[data-slot="treemap-chart-tile"]')
      );
    const smallestNode = args.nodes[args.nodes.length - 1];

    await expect(
      canvas.getByRole('application', { name: args.label })
    ).toBeInTheDocument();

    // Every part is readable without the tiles, header row included.
    const table = canvas.getByRole('table', { name: args.label });
    await expect(within(table).getAllByRole('row')).toHaveLength(
      args.nodes.length + 1
    );

    // That table is read, never laid out: its wrapper takes no room at all.
    const tableWrapper = table.parentElement;
    await expect(tableWrapper).toHaveClass('sr-only');
    const wrapperBounds = tableWrapper?.getBoundingClientRect();
    await expect(wrapperBounds?.width).toBeLessThanOrEqual(1);
    await expect(wrapperBounds?.height).toBeLessThanOrEqual(1);

    await waitFor(() => expect(tiles()).toHaveLength(args.nodes.length));

    // The tail has no room for a label, so only the tooltip names it.
    const smallestTile = tiles()[args.nodes.length - 1];
    await expect(smallestTile.querySelector('text')).toBeNull();

    await userEvent.hover(smallestTile);

    await waitFor(() => expect(tooltip()).toBeInTheDocument());
    await expect(tooltip()?.textContent).toContain(smallestNode.label);
  },
};

export const Grouped: Story = {
  args: {
    label: 'Where a year of everyday spending went, by area of life',
    nodes: groupedNodes,
    height: 'lg',
  },
  play: async ({ args, canvasElement }) => {
    const textsIn = (slot: string) => () =>
      Array.from(
        canvasElement.querySelectorAll(`[data-slot="${slot}"] text`),
        (text) => text.textContent
      );
    const tileLabels = textsIn('treemap-chart-tile');
    const groupLabels = textsIn('treemap-chart-group');

    // A part with room for its own name keeps it, group name or not.
    await waitFor(() => expect(tileLabels()).toContain('Electricity'));
    await expect(tileLabels()).toContain('Dining out');

    // And every group still says which group it is.
    const groupNames = Array.from(
      new Set(args.nodes.map((node) => node.group))
    );
    await expect(groupLabels()).toEqual(groupNames);
  },
};

/** A group worth a hundredth of the whole still gets exactly its hundredth. */
export const UnevenGroups: Story = {
  args: {
    label: 'Disk use by folder',
    nodes: [
      { id: 'video', label: 'Video', value: 620, group: 'Media' },
      { id: 'photos', label: 'Photos', value: 370, group: 'Media' },
      { id: 'notes', label: 'Notes', value: 7, group: 'Documents' },
      { id: 'invoices', label: 'Invoices', value: 3, group: 'Documents' },
    ],
    valueFormatter: (value: number) => `${value}GB`,
  },
};

export const ColoredByValue: Story = {
  args: {
    colorBy: 'value',
  },
};

export const Empty: Story = {
  args: {
    label: 'Where a year of everyday spending went',
    nodes: [],
  },
};
