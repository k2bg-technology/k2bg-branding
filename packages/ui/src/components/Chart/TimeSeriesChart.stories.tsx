import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import {
  ChartColor,
  ChartInterpolation,
  type TimeSeriesBandPoint,
  TimeSeriesChart,
  type TimeSeriesPoint,
} from '.';

function storyTimestamp(index: number): number {
  return Date.UTC(2026, 0, 1 + index * 2);
}

function toPoints(values: (number | null)[]): TimeSeriesPoint[] {
  return values.map((value, index) => ({
    timestamp: storyTimestamp(index),
    value,
  }));
}

function toBandPoints(bounds: [number, number][]): TimeSeriesBandPoint[] {
  return bounds.map(([low, high], index) => ({
    timestamp: storyTimestamp(index),
    low,
    high,
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

const restingHeartRate = [
  57, 58, 56, 59, 58, 57, 60, 58, 57, 59, 58, 56, 57, 59, 58,
];
const medianAbsoluteDeviation = 2.5;

const projectionMedian = [
  100, 103, 106, 109, 113, 116, 120, 124, 128, 132, 137, 141, 146, 151, 156,
];

/** A Monte Carlo cone widens with the square root of the elapsed horizon. */
function projectionSpread(index: number): number {
  return Math.round(3.2 * Math.sqrt(index) * 10) / 10;
}

const oneHour = 60 * 60 * 1000;
/** 15:00 UTC, so the day of hourly readings starts at midnight in Tokyo. */
const tokyoMidnight = Date.UTC(2026, 0, 14, 15);

const linearInterpolationLabel =
  'Carbon dioxide against the ventilation limit, linear interpolation';
const naturalInterpolationLabel =
  'Carbon dioxide against the ventilation limit, natural interpolation';

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
    interpolation: {
      control: 'select',
      options: ['linear', 'step', 'natural'],
    },
    timeZone: {
      control: 'text',
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
          21.9,
          null,
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

export const WithThresholdAndBands: Story = {
  args: {
    label: 'Humidity against the comfort range over January 2026',
    valueFormatter: (value: number) => `${value}%`,
    series: [
      {
        id: 'humidity',
        label: 'Humidity',
        points: toPoints([
          58, 54, 49, 44, 39, 36, 41, 47, 52, 57, 62, 65, 61, 55, 48,
        ]),
      },
    ],
    bands: [{ id: 'comfort', from: 40, to: 60, color: ChartColor.SUCCESS }],
    thresholds: [
      {
        id: 'dry',
        value: 30,
        label: 'Dry',
        color: ChartColor.WARNING,
      },
    ],
  },
};

export const WithBandSeries: Story = {
  args: {
    label: 'Resting heart rate and its typical spread over January 2026',
    valueFormatter: (value: number) => `${value}bpm`,
    series: [
      {
        kind: 'band',
        id: 'spread',
        label: 'Typical spread',
        color: ChartColor.CHART_1,
        points: toBandPoints(
          restingHeartRate.map((value): [number, number] => [
            value - medianAbsoluteDeviation,
            value + medianAbsoluteDeviation,
          ])
        ),
      },
      {
        id: 'median',
        label: 'Median',
        color: ChartColor.CHART_1,
        points: toPoints(restingHeartRate),
      },
      {
        id: 'deviations',
        label: 'Outside the spread',
        color: ChartColor.ERROR,
        points: toPoints([
          null,
          null,
          null,
          68,
          null,
          null,
          null,
          null,
          null,
          71,
          null,
          null,
          66,
          null,
          null,
        ]),
      },
    ],
  },
};

export const FanChart: Story = {
  args: {
    label: 'Simulated portfolio index over the next 30 days',
    series: [
      {
        kind: 'band',
        id: 'percentile10To90',
        label: '10th–90th percentile',
        color: ChartColor.CHART_1,
        fillOpacity: 0.15,
        points: toBandPoints(
          projectionMedian.map((value, index): [number, number] => [
            value - projectionSpread(index) * 2,
            value + projectionSpread(index) * 2,
          ])
        ),
      },
      {
        kind: 'band',
        id: 'percentile25To75',
        label: '25th–75th percentile',
        color: ChartColor.CHART_1,
        fillOpacity: 0.3,
        points: toBandPoints(
          projectionMedian.map((value, index): [number, number] => [
            value - projectionSpread(index),
            value + projectionSpread(index),
          ])
        ),
      },
      {
        id: 'median',
        label: 'Median outcome',
        color: ChartColor.CHART_1,
        points: toPoints(projectionMedian),
      },
    ],
    thresholds: [
      {
        id: 'target',
        value: 150,
        label: 'Target',
        color: ChartColor.SUCCESS,
      },
    ],
  },
};

export const TimeZoneJapan: Story = {
  args: {
    label: 'Bedroom carbon dioxide over one Japanese day',
    period: 'day',
    timeZone: 'Asia/Tokyo',
    valueFormatter: (value: number) => `${value}ppm`,
    series: [
      {
        id: 'carbonDioxide',
        label: 'Carbon dioxide',
        points: [
          820, 880, 930, 980, 1010, 1040, 1060, 900, 620, 540, 500, 480, 470,
          490, 520, 560, 620, 700, 780, 840, 900, 950, 880, 840,
        ].map((value, index) => ({
          timestamp: tokyoMidnight + index * oneHour,
          value,
        })),
      },
    ],
  },
};

export const InterpolationComparison: Story = {
  args: {
    label: linearInterpolationLabel,
    series: [
      {
        id: 'carbonDioxide',
        label: 'Carbon dioxide',
        points: toPoints([900, 990, 990, 900]),
      },
    ],
    thresholds: [
      {
        id: 'ventilationLimit',
        value: 1000,
        label: 'Limit',
        color: ChartColor.ERROR,
      },
    ],
  },
  render: (args) => (
    <div className="grid gap-spacious lg:grid-cols-2">
      <TimeSeriesChart
        {...args}
        label={linearInterpolationLabel}
        interpolation={ChartInterpolation.LINEAR}
      />
      <TimeSeriesChart
        {...args}
        label={naturalInterpolationLabel}
        interpolation={ChartInterpolation.NATURAL}
      />
    </div>
  ),
  // The meta play addresses a single chart; this story renders two.
  play: async ({ canvas, canvasElement, userEvent }) => {
    const tooltip = () =>
      canvasElement.querySelector('[data-slot="chart-tooltip"]');

    await userEvent.tab();
    await expect(
      canvas.getByRole('application', { name: linearInterpolationLabel })
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');

    await waitFor(() => expect(tooltip()).toBeInTheDocument());
  },
};
