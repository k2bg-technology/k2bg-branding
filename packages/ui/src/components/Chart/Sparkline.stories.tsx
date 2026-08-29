import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { DataTable } from '../DataTable';

import { ChartColor, Sparkline } from '.';

const livingRoomTemperatures = [
  19.8, 20.1, 20.4, 20.2, 20.9, 21.3, 21.1, 20.6, 20.4, 20.8, 21.4, 21.9, 21.6,
  21.4,
];

const bedroomTemperatures = [
  18.2, 18.4, 18.6, 18.3, 18.9, 19.2, 19.3, 18.8, 18.5, 18.7, 19.1, 19.4, 19.2,
  18.9,
];

const studyTemperatures = [
  20.4,
  20.2,
  null,
  null,
  20.8,
  21.1,
  21.4,
  21.2,
  20.9,
  20.6,
  null,
  21.0,
  21.3,
  21.1,
];

const meta = {
  component: Sparkline,
  args: {
    label: 'Living room temperature over the last 14 days',
    values: livingRoomTemperatures,
  },
  argTypes: {
    color: {
      control: 'select',
      options: Object.values(ChartColor),
    },
  },
  play: async ({ args, canvas }) => {
    const chart = canvas.getByRole('img', { name: args.label });
    // One polyline per run of consecutive measurements, so count the runs by
    // their first value.
    const expectedRunCount = args.values.filter(
      (value, index) =>
        value !== null && (index === 0 || args.values[index - 1] === null)
    ).length;

    await expect(chart.querySelectorAll('polyline')).toHaveLength(
      expectedRunCount
    );
  },
  parameters: {
    docs: {
      description: {
        component: 'components.sparkline.description',
      },
      overview: 'components.sparkline.overview',
      usage: 'components.sparkline.usage',
      accessibility: 'components.sparkline.accessibility',
      doList: 'components.sparkline.doList',
      dontList: 'components.sparkline.dontList',
      relatedComponents: 'components.sparkline.relatedComponents',
      dependencies: 'components.sparkline.dependencies',
      references: 'components.sparkline.references',
    },
  },
} satisfies Meta<typeof Sparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithGaps: Story = {
  args: {
    label: 'Study temperature over the last 14 days, with sensor outages',
    values: studyTemperatures,
    color: ChartColor.CHART_2,
  },
};

export const InDataTableCell: Story = {
  args: {
    label: 'Living room temperature trend',
  },
  render: (args) => (
    <DataTable
      caption="Room temperature over the last 14 days"
      columns={[
        { id: 'room', header: 'Room' },
        { id: 'trend', header: 'Trend' },
        { id: 'latest', header: 'Latest', align: 'end' },
      ]}
      rows={[
        {
          id: 'livingRoom',
          cells: {
            room: 'Living room',
            trend: <Sparkline {...args} className="h-6 w-24" />,
            latest: '21.4°C',
          },
        },
        {
          id: 'bedroom',
          cells: {
            room: 'Bedroom',
            trend: (
              <Sparkline
                label="Bedroom temperature trend"
                values={bedroomTemperatures}
                color={ChartColor.CHART_2}
                className="h-6 w-24"
              />
            ),
            latest: '18.9°C',
          },
        },
        {
          id: 'study',
          cells: {
            room: 'Study',
            trend: (
              <Sparkline
                label="Study temperature trend"
                values={studyTemperatures}
                color={ChartColor.CHART_3}
                className="h-6 w-24"
              />
            ),
            latest: '21.1°C',
          },
        },
      ]}
    />
  ),
};
