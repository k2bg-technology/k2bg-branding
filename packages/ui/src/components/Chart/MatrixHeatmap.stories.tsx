import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { ChartColor, MatrixHeatmap } from '.';

const hourRows = Array.from(
  { length: 24 },
  (_, hour) => `${String(hour).padStart(2, '0')}:00`
);

const weekdayColumns = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Two characters per hour, so 24 of them still read at a small cell size. */
const hourColumns = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, '0')
);

/** Deterministic stand-in for sampled data, so every render is identical. */
function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

/** A closed bedroom builds up overnight, and more so on weekends spent indoors. */
function buildCarbonDioxideValues() {
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

const carbonDioxideByWeekday = weekdayColumns.map((_, weekday) =>
  hourColumns.map((__, hour) => carbonDioxideValues[hour][weekday])
);

const defaultContainerClassName = 'max-w-xs';

/** The `pr-1` that separates a row label from its first cell. */
const rowLabelPaddingWidth = 4;
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
    minimumCellSize: { control: 'number' },
    maximumCellSize: { control: 'number' },
  },
  decorators: [
    (Story, context) => (
      <div
        className={
          typeof context.parameters.containerClassName === 'string'
            ? context.parameters.containerClassName
            : defaultContainerClassName
        }
      >
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

export const TwentyFourColumnsNarrow: Story = {
  args: {
    label:
      'Carbon dioxide concentration by day of week and hour of day, in a narrow card',
    rows: weekdayColumns,
    columns: hourColumns,
    values: carbonDioxideByWeekday,
    minimumCellSize: 20,
  },
  play: async ({ args, canvas, canvasElement }) => {
    const grid = canvas.getByRole('img', { name: args.label });
    const viewport = scrollPort(canvasElement);

    // The scroll area derives the focusable state from a measurement it takes
    // after layout, so it can land a frame later than this play does.
    await waitFor(() => {
      // 24 hour columns outgrow this card.
      expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth);
      // A scrolling region has to be reachable by keyboard (WCAG 2.1.1).
      expect(viewport.tabIndex).toBe(0);
    });

    viewport.scrollLeft = viewport.scrollWidth;

    const labels = Array.from(
      canvasElement.querySelectorAll<HTMLElement>(
        '[data-slot="matrix-heatmap-row-label"]'
      )
    );
    const cells = Array.from(
      grid.querySelectorAll<HTMLElement>('[data-slot="matrix-heatmap-cell"]')
    );

    // Scrolled to the end, every label still sits on the row it names.
    await waitFor(() => {
      const centreOffsets = labels.map((label, rowIndex) => {
        const labelBox = label.getBoundingClientRect();
        const cellBox =
          cells[rowIndex * args.columns.length].getBoundingClientRect();
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

export const WideContainer: Story = {
  args: {
    label:
      'Carbon dioxide concentration by hour of day and day of week, in a wide card',
  },
  parameters: { containerClassName: 'max-w-4xl' },
};

export const ZeroVersusEmpty: Story = {
  args: {
    label: 'Minutes of rainfall by part of day, with one gauge outage',
    rows: ['Mon', 'Tue', 'Wed'],
    columns: ['Morning', 'Midday', 'Evening'],
    values: [
      [0, 12, 0],
      [null, 0, 4],
      [6, null, 0],
    ],
    valueFormatter: (value: number) => `${value} min`,
    emptyLabel: 'No reading',
    scaleLabels: { less: 'Drier', more: 'Wetter' },
  },
  play: async ({ args, canvas }) => {
    const chart = canvas.getByRole('img', { name: args.label });
    const cells = chart.querySelectorAll<HTMLElement>(
      '[data-slot="matrix-heatmap-cell"]'
    );

    // A measured zero stays filled; only a missing reading is left unpainted.
    await expect(cells[0].style.backgroundColor).not.toBe('');
    await expect(cells[3].title).toBe('Tue Morning: No reading');

    // Three capped cells leave this card with width to spare: it stays beside
    // the grid instead of widening the row-label column. Measured under
    // `waitFor` so a late font or measurement cannot decide the comparison.
    const rowLabel = canvas.getByText('Tue');

    await waitFor(() => {
      const textBounds = document.createRange();
      textBounds.selectNodeContents(rowLabel);

      expect(rowLabel.getBoundingClientRect().width).toBeLessThanOrEqual(
        textBounds.getBoundingClientRect().width +
          rowLabelPaddingWidth +
          subpixelTolerance
      );
    });
  },
};
