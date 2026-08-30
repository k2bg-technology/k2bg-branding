import type { Meta, StoryObj } from '@storybook/react-vite';

import { DataTable } from '.';

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
