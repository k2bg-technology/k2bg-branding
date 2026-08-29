import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { ChartColor, MatrixHeatmap } from '.';

const hourRows = Array.from(
  { length: 24 },
  (_, hour) => `${String(hour).padStart(2, '0')}:00`
);

const weekdayColumns = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Deterministic stand-in for sampled data, so every render is identical. */
function pseudoRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

/** A closed bedroom builds up overnight, and more so on weekends spent indoors. */
function buildCarbonDioxideValues(): number[][] {
  return hourRows.map((_, hour) =>
    weekdayColumns.map((__, weekday) => {
      const isNight = hour >= 23 || hour < 7;
      const isWeekend = weekday >= 5;
      const occupancy = (isNight ? 540 : 170) + (isWeekend ? 220 : 0);
      return Math.round(
        430 +
          occupancy +
          pseudoRandom(hour * weekdayColumns.length + weekday) * 180
      );
    })
  );
}

const carbonDioxideValues = buildCarbonDioxideValues();

const meta = {
  component: MatrixHeatmap,
  args: {
    label:
      'Carbon dioxide concentration by hour of day and day of week, August 2026',
    rows: hourRows,
    columns: weekdayColumns,
    values: carbonDioxideValues,
    valueFormatter: (value: number) => `${value.toLocaleString('en-US')}ppm`,
    scaleLabels: { less: 'Lower', more: 'Higher' },
  },
  argTypes: {
    color: {
      control: 'select',
      options: Object.values(ChartColor),
    },
    min: { control: 'number' },
    max: { control: 'number' },
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
  play: async ({ args, canvas }) => {
    const chart = canvas.getByRole('img', { name: args.label });

    await expect(
      chart.querySelectorAll('[data-slot="matrix-heatmap-cell"]')
    ).toHaveLength(args.rows.length * args.columns.length);
  },
  parameters: {
    docs: {
      description: {
        component: 'components.matrixHeatmap.description',
      },
      overview: 'components.matrixHeatmap.overview',
      usage: 'components.matrixHeatmap.usage',
      accessibility: 'components.matrixHeatmap.accessibility',
      doList: 'components.matrixHeatmap.doList',
      dontList: 'components.matrixHeatmap.dontList',
      relatedComponents: 'components.matrixHeatmap.relatedComponents',
      dependencies: 'components.matrixHeatmap.dependencies',
      references: 'components.matrixHeatmap.references',
    },
  },
} satisfies Meta<typeof MatrixHeatmap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMissingValues: Story = {
  args: {
    label:
      'Carbon dioxide concentration by hour of day and day of week, with sensor outages',
    values: carbonDioxideValues.map((row, hour) =>
      row.map((value, weekday) =>
        // The sensor dropped out over one Thursday night.
        weekday === 3 && (hour >= 22 || hour < 5) ? null : value
      )
    ),
  },
};

export const CustomRange: Story = {
  args: {
    label:
      'Carbon dioxide concentration by hour of day and day of week, on a fixed 400 to 1600 ppm scale',
    min: 400,
    max: 1600,
  },
};
