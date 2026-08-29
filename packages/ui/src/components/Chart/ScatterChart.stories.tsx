import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { ChartColor, ScatterChart, type ScatterChartPoint } from '.';

function toPoints(pairs: [number, number][]): ScatterChartPoint[] {
  return pairs.map(([x, y]) => ({ x, y }));
}

// Bedroom carbon dioxide against the deep sleep it coincided with: the
// cleaner the air, the longer the deep phases.
const bedroomNights = toPoints([
  [612, 108],
  [648, 101],
  [671, 106],
  [703, 97],
  [742, 99],
  [768, 92],
  [795, 95],
  [824, 88],
  [860, 90],
  [889, 83],
  [915, 86],
  [947, 78],
  [982, 80],
  [1014, 73],
  [1048, 75],
  [1082, 66],
  [1121, 69],
  [1163, 58],
  [1204, 52],
]);

const carbonDioxide = (value: number) => `${value} ppm`;
const minutes = (value: number) => `${value} min`;

const meta = {
  component: ScatterChart,
  args: {
    label: 'Bedroom carbon dioxide against deep sleep',
    xLabel: 'Carbon dioxide',
    yLabel: 'Deep sleep',
    series: [{ id: 'bedroom', label: 'Bedroom', points: bedroomNights }],
    xValueFormatter: carbonDioxide,
    yValueFormatter: minutes,
  },
  argTypes: {
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
    const points = canvasElement.querySelectorAll('.recharts-symbols');

    await expect(chart).toBeInTheDocument();
    await expect(points.length).toBeGreaterThan(0);

    // Points answer to the pointer rather than the keyboard, so hovering is
    // the only way to reach the tooltip.
    await userEvent.hover(points[0]);
    await waitFor(() => expect(tooltip()).toBeInTheDocument());
    const firstTooltipText = tooltip()?.textContent;

    await userEvent.hover(points[points.length - 1]);

    await waitFor(() =>
      expect(tooltip()?.textContent).not.toBe(firstTooltipText)
    );
  },
  parameters: {
    docs: {
      description: {
        component: 'components.scatterChart.description',
      },
      overview: 'components.scatterChart.overview',
      usage: 'components.scatterChart.usage',
      accessibility: 'components.scatterChart.accessibility',
      doList: 'components.scatterChart.doList',
      dontList: 'components.scatterChart.dontList',
      relatedComponents: 'components.scatterChart.relatedComponents',
      dependencies: 'components.scatterChart.dependencies',
      references: 'components.scatterChart.references',
    },
  },
} satisfies Meta<typeof ScatterChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTrendLine: Story = {
  args: {
    label: 'Bedroom carbon dioxide against deep sleep with its fitted trend',
    // Least-squares fit of the bedroom nights above.
    trendLine: { slope: -0.0855, intercept: 160.6 },
  },
};

export const MultiSeries: Story = {
  args: {
    label: 'Carbon dioxide against deep sleep per room',
    series: [
      { id: 'bedroom', label: 'Bedroom', points: bedroomNights },
      {
        id: 'guestRoom',
        label: 'Guest room',
        color: ChartColor.CHART_3,
        points: toPoints([
          [588, 96],
          [640, 91],
          [694, 94],
          [736, 85],
          [781, 87],
          [838, 79],
          [902, 81],
          [966, 72],
          [1035, 68],
          [1128, 61],
        ]),
      },
    ],
  },
};
