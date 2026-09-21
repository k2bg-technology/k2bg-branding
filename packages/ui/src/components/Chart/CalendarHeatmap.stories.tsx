import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { CalendarHeatmap, type CalendarHeatmapDay, ChartColor } from '.';

const dayMs = 86_400_000;

/** Deterministic stand-in for sampled data, so every render is identical. */
function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function buildStepDays(
  startTime: number,
  dayCount: number
): CalendarHeatmapDay[] {
  return Array.from({ length: dayCount }, (_, index) => {
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

/** 2026-02-23 is a Monday, so 182 days fill exactly 26 whole weeks. */
const halfYearOfSteps = buildStepDays(Date.UTC(2026, 1, 23), 182);
/** 2025-11-24 is a Monday, and 52 weeks from it run across the turn of the year. */
const fullYearOfSteps = buildStepDays(Date.UTC(2025, 10, 24), 364);

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const scaleLabels = { less: 'Less', more: 'More' };
const subpixelTolerance = 2;
const alignmentTolerance = 1;

/** The scroll area marks its scrolling element with a `-viewport` id. */
function scrollPort(canvasElement: HTMLElement) {
  const viewport = canvasElement.querySelector<HTMLElement>(
    '[data-id$="-viewport"]'
  );
  if (viewport === null) {
    throw new Error('the scroll area rendered no viewport');
  }
  return viewport;
}

const meta = {
  component: CalendarHeatmap,
  args: {
    label: 'Daily step count over the last 26 weeks',
    days: halfYearOfSteps,
    valueFormatter: (value: number) => value.toLocaleString('en-US'),
  },
  argTypes: {
    color: {
      control: 'select',
      options: Object.values(ChartColor),
    },
    max: { control: 'number' },
    locale: { control: 'text' },
    minimumCellSize: { control: 'number' },
    maximumCellSize: { control: 'number' },
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
    scaleLabels,
  },
};

export const FullYearWithMonthLabels: Story = {
  args: {
    label: 'Daily step count over the last year',
    days: fullYearOfSteps,
    weekdayLabels,
    scaleLabels,
  },
  play: async ({ canvas }) => {
    // The first month of a new year carries the year with it.
    await expect(canvas.getByText('2026/1')).toBeInTheDocument();
  },
};

export const LocalizedJapanese: Story = {
  args: {
    label: '直近1年の1日あたりの歩数',
    days: fullYearOfSteps,
    locale: 'ja-JP',
    emptyLabel: 'データなし',
    scaleLabels: { less: '少ない', more: '多い' },
    valueFormatter: (value: number) => `${value.toLocaleString('ja-JP')}歩`,
  },
  play: async ({ canvas }) => {
    // Japanese weeks start on Sunday, so the first labelled row is 日.
    await expect(canvas.getByText('日')).toBeInTheDocument();
  },
};

export const SundayFirst: Story = {
  args: {
    label: 'Daily step count over the last 26 weeks, weeks starting on Sunday',
    locale: 'en-US',
    scaleLabels,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Sun')).toBeInTheDocument();
  },
};

export const NarrowContainer: Story = {
  args: {
    label: 'Daily step count over the last 26 weeks, in a narrow card',
    weekdayLabels,
    scaleLabels,
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  play: async ({ args, canvas, canvasElement }) => {
    const grid = canvas.getByRole('img', { name: args.label });
    const root = grid.closest('[data-slot="calendar-heatmap"]');
    const viewport = scrollPort(canvasElement);
    const cardWidth = root?.parentElement?.getBoundingClientRect().width ?? 0;

    // 26 week columns outgrow this card, so the grid scrolls inside it rather
    // than pushing the component past the card edge.
    await expect(root?.getBoundingClientRect().width ?? 0).toBeLessThanOrEqual(
      cardWidth + subpixelTolerance
    );
    // The scroll area derives the focusable state from a measurement it takes
    // after layout, so it can land a frame later than this play does.
    await waitFor(() => {
      expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth);
      // A scrolling region has to be reachable by keyboard (WCAG 2.1.1).
      expect(viewport.tabIndex).toBe(0);
    });

    viewport.scrollLeft = viewport.scrollWidth;

    const labels = Array.from(
      canvasElement.querySelectorAll<HTMLElement>(
        '[data-slot="calendar-heatmap-weekday-label"]'
      )
    );
    // Cells run down each week column, so the first seven are one week of rows.
    const cells = Array.from(
      grid.querySelectorAll<HTMLElement>('[data-slot="calendar-heatmap-cell"]')
    );

    // Scrolled to the end, every label still sits on the row it names.
    await waitFor(() => {
      const centreOffsets = labels.map((label, rowIndex) => {
        const labelBox = label.getBoundingClientRect();
        const cellBox = cells[rowIndex].getBoundingClientRect();
        return Math.abs(
          labelBox.top +
            labelBox.height / 2 -
            (cellBox.top + cellBox.height / 2)
        );
      });

      expect(Math.max(...centreOffsets)).toBeLessThanOrEqual(
        alignmentTolerance
      );
    });

    // No cell is drawn over a label: the port clips them, and a clipped cell
    // keeps its off-screen bounding box, so compare against the visible part.
    await waitFor(() => {
      const portLeft = viewport.getBoundingClientRect().left;
      const labelRight = Math.max(
        ...labels.map((label) => label.getBoundingClientRect().right)
      );
      const visibleCellLeft = Math.min(
        ...cells.map((cell) =>
          Math.max(cell.getBoundingClientRect().left, portLeft)
        )
      );

      expect(visibleCellLeft).toBeGreaterThanOrEqual(
        labelRight - subpixelTolerance
      );
    });
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
