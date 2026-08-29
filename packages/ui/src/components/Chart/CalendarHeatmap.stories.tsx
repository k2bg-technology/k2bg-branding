import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { CalendarHeatmap, type CalendarHeatmapDay, ChartColor } from '.';

const dayMs = 86_400_000;

/** Deterministic stand-in for sampled data, so every render is identical. */
function pseudoRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

/** 2026-02-23 is a Monday, so 182 days fill exactly 26 whole weeks. */
function buildStepDays(): CalendarHeatmapDay[] {
  const startTime = Date.UTC(2026, 1, 23);
  return Array.from({ length: 182 }, (_, index) => {
    const date = new Date(startTime + index * dayMs).toISOString().slice(0, 10);
    const noise = pseudoRandom(index);
    if (noise > 0.94) {
      return { date, value: null };
    }
    if (noise < 0.05) {
      return { date, value: 0 };
    }
    const isWeekend = index % 7 >= 5;
    return {
      date,
      value: Math.round((isWeekend ? 11500 : 6800) + noise * 7400),
    };
  });
}

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const meta = {
  component: CalendarHeatmap,
  args: {
    label: 'Daily step count over the last 26 weeks',
    days: buildStepDays(),
    valueFormatter: (value: number) => value.toLocaleString('en-US'),
  },
  argTypes: {
    color: {
      control: 'select',
      options: Object.values(ChartColor),
    },
    max: { control: 'number' },
  },
  play: async ({ args, canvas }) => {
    const chart = canvas.getByRole('img', { name: args.label });
    const cells = chart.querySelectorAll('[data-slot="calendar-heatmap-cell"]');

    await expect(cells.length).toBeGreaterThan(0);
    // Padding back to Monday and forward to Sunday always yields whole weeks.
    await expect(cells.length % 7).toBe(0);
  },
  parameters: {
    docs: {
      description: {
        component: 'components.calendarHeatmap.description',
      },
      overview: 'components.calendarHeatmap.overview',
      usage: 'components.calendarHeatmap.usage',
      accessibility: 'components.calendarHeatmap.accessibility',
      doList: 'components.calendarHeatmap.doList',
      dontList: 'components.calendarHeatmap.dontList',
      relatedComponents: 'components.calendarHeatmap.relatedComponents',
      dependencies: 'components.calendarHeatmap.dependencies',
      references: 'components.calendarHeatmap.references',
    },
  },
} satisfies Meta<typeof CalendarHeatmap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithWeekdayLabelsAndScale: Story = {
  args: {
    weekdayLabels,
    scaleLabels: { less: 'Less', more: 'More' },
  },
};

export const SparseData: Story = {
  args: {
    label: 'Days with a recorded long run',
    days: [
      { date: '2026-06-02', value: 12 },
      { date: '2026-06-14', value: 21 },
      { date: '2026-06-28', value: 18 },
      { date: '2026-07-05', value: 32 },
      { date: '2026-07-19', value: 24 },
      { date: '2026-08-01', value: 42 },
      { date: '2026-08-16', value: 15 },
    ],
    valueFormatter: (value: number) => `${value}km`,
    weekdayLabels,
    scaleLabels: { less: 'Shorter', more: 'Longer' },
  },
};
