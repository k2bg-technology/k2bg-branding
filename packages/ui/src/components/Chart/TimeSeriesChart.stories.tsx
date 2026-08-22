import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { ChartColor, TimeSeriesChart, type TimeSeriesPoint } from '.';

function toPoints(values: (number | null)[]): TimeSeriesPoint[] {
  return values.map((value, index) => ({
    timestamp: Date.UTC(2026, 0, 1 + index * 2),
    value,
  }));
}

const livingRoomSeries = {
  id: 'livingRoom',
  label: 'Living room',
  points: toPoints([
    19.8, 20.4, 21.1, 20.7, 21.9, 22.4, 21.6, 22.8, 23.5, 22.9, 23.8, 24.2,
    23.4, 24.6, 25.1,
  ]),
};

const bedroomSeries = {
  id: 'bedroom',
  label: 'Bedroom',
  points: toPoints([
    18.2, 18.6, 19.3, 18.9, 19.8, 20.5, 19.9, 20.8, 21.2, 20.6, 21.4, 21.9,
    21.1, 22.0, 22.6,
  ]),
};

const meta = {
  component: TimeSeriesChart,
  args: {
    label: 'Room temperature over January 2026',
    series: [livingRoomSeries, bedroomSeries],
    period: 'month',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['line', 'area'],
    },
    period: {
      control: 'select',
      options: ['day', 'week', 'month', 'quarter', 'year'],
    },
    height: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    showLegend: {
      control: 'boolean',
    },
    animated: {
      control: 'boolean',
    },
  },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const chart = canvas.getByRole('application', { name: args.label });
    const tooltip = () =>
      canvasElement.querySelector('[data-slot="chart-tooltip"]');

    await userEvent.tab();
    await expect(chart).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(tooltip()).toBeInTheDocument());
    const firstTooltipText = tooltip()?.textContent;

    await userEvent.keyboard('{ArrowRight}');

    await waitFor(() =>
      expect(tooltip()?.textContent).not.toBe(firstTooltipText)
    );
  },
  parameters: {
    docs: {
      description: {
        component: 'components.timeSeriesChart.description',
      },
      overview: 'components.timeSeriesChart.overview',
      usage: 'components.timeSeriesChart.usage',
      accessibility: 'components.timeSeriesChart.accessibility',
      doList: 'components.timeSeriesChart.doList',
      dontList: 'components.timeSeriesChart.dontList',
      relatedComponents: 'components.timeSeriesChart.relatedComponents',
      dependencies: 'components.timeSeriesChart.dependencies',
      references: 'components.timeSeriesChart.references',
    },
  },
} satisfies Meta<typeof TimeSeriesChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Area: Story = {
  args: {
    variant: 'area',
  },
};

export const MultiSeries: Story = {
  args: {
    label: 'Power draw per room over January 2026',
    series: [
      {
        id: 'livingRoom',
        label: 'Living room',
        points: toPoints([
          320, 340, 335, 360, 380, 375, 390, 410, 405, 425, 440, 430, 450, 465,
          455,
        ]),
      },
      {
        id: 'kitchen',
        label: 'Kitchen',
        points: toPoints([
          280, 290, 310, 300, 320, 335, 325, 345, 355, 350, 365, 380, 370, 385,
          395,
        ]),
      },
      {
        id: 'bedroom',
        label: 'Bedroom',
        points: toPoints([
          150, 155, 165, 160, 175, 185, 180, 190, 200, 195, 205, 215, 210, 220,
          230,
        ]),
      },
      {
        id: 'office',
        label: 'Office',
        points: toPoints([
          210, 220, 215, 235, 250, 245, 260, 275, 270, 290, 300, 295, 310, 325,
          315,
        ]),
      },
      {
        id: 'garage',
        label: 'Garage',
        points: toPoints([
          80, 85, 95, 90, 100, 110, 105, 115, 125, 120, 130, 140, 135, 145, 150,
        ]),
      },
    ],
  },
};

export const WithGaps: Story = {
  args: {
    label: 'Sensor readings with dropouts over January 2026',
    series: [
      {
        id: 'livingRoom',
        label: 'Living room',
        points: toPoints([
          19.8,
          20.4,
          21.1,
          null,
          null,
          22.4,
          21.6,
          22.8,
          23.5,
          null,
          23.8,
          24.2,
          23.4,
          24.6,
          25.1,
        ]),
      },
      bedroomSeries,
    ],
  },
};

export const StatusColors: Story = {
  args: {
    label: 'Heart rate against the healthy range over January 2026',
    series: [
      {
        id: 'resting',
        label: 'Resting (healthy)',
        color: ChartColor.SUCCESS,
        points: toPoints([
          62, 64, 63, 65, 66, 64, 63, 65, 67, 66, 64, 63, 65, 64, 62,
        ]),
      },
      {
        id: 'stressed',
        label: 'Under stress',
        color: ChartColor.ERROR,
        points: toPoints([
          88, 92, 95, 91, 98, 102, 97, 105, 110, 104, 99, 96, 101, 94, 90,
        ]),
      },
    ],
  },
};
