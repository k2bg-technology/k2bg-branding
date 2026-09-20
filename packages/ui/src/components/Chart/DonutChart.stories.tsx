import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { ChartColor, DonutChart } from '.';

const millionYen = (value: number) => `¥${value.toFixed(1)}M`;

const meta = {
  component: DonutChart,
  args: {
    label: 'Asset allocation by instrument',
    slices: [
      { id: 'equity', label: 'Equity', value: 6.2 },
      { id: 'funds', label: 'Funds', value: 3.4 },
      { id: 'cash', label: 'Cash', value: 1.9 },
      { id: 'other', label: 'Other', value: 0.9 },
    ],
    centerValue: '¥12.4M',
    centerLabel: 'Total assets',
    valueFormatter: millionYen,
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
    const sectors = canvasElement.querySelectorAll('.recharts-sector');

    await expect(chart).toBeInTheDocument();
    await expect(sectors).toHaveLength(args.slices.length);

    // Sectors answer to the pointer rather than the keyboard, so hovering is
    // the only way to reach the tooltip.
    await userEvent.hover(sectors[0]);
    await waitFor(() => expect(tooltip()).toBeInTheDocument());
    const firstTooltipText = tooltip()?.textContent;

    await userEvent.hover(sectors[1]);

    await waitFor(() =>
      expect(tooltip()?.textContent).not.toBe(firstTooltipText)
    );
  },
  parameters: {
    docs: {
      description: {
        component: 'components.donutChart.description',
      },
      overview: 'components.donutChart.overview',
      usage: 'components.donutChart.usage',
      accessibility: 'components.donutChart.accessibility',
      doList: 'components.donutChart.doList',
      dontList: 'components.donutChart.dontList',
      relatedComponents: 'components.donutChart.relatedComponents',
      dependencies: 'components.donutChart.dependencies',
      references: 'components.donutChart.references',
    },
  },
} satisfies Meta<typeof DonutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutCenterText: Story = {
  args: {
    label: 'Asset allocation by instrument without a headline',
    centerValue: undefined,
    centerLabel: undefined,
  },
};

export const StatusColors: Story = {
  args: {
    label: 'Monthly budget against its outcome',
    slices: [
      {
        id: 'withinBudget',
        label: 'Within budget',
        color: ChartColor.SUCCESS,
        value: 7.4,
      },
      {
        id: 'watch',
        label: 'Watch',
        color: ChartColor.WARNING,
        value: 2.6,
      },
      {
        id: 'overspent',
        label: 'Overspent',
        color: ChartColor.ERROR,
        value: 1.1,
      },
    ],
    centerValue: '¥11.1M',
    centerLabel: 'Spent this year',
  },
};

const longCenterValue = '¥1,234,567';

// The ring's hole spans 65% of the chart's smaller side; the center text must
// stay inside it however long the value is.
const expectCenterValueInsideTheRing: Story['play'] = async ({
  args,
  canvas,
}) => {
  const centerValue = canvas.getByText(longCenterValue);
  const chartBounds = canvas
    .getByRole('application', { name: args.label })
    .getBoundingClientRect();
  const valueBounds = centerValue.getBoundingClientRect();
  const holeDiameter = 0.65 * Math.min(chartBounds.width, chartBounds.height);
  // A range reports one client rect per line box, so an unbroken single token
  // reports exactly one.
  const lines = document.createRange();
  lines.selectNodeContents(centerValue);

  await expect(lines.getClientRects()).toHaveLength(1);
  await expect(centerValue.scrollWidth).toBeLessThanOrEqual(
    centerValue.clientWidth
  );
  await expect(valueBounds.width).toBeLessThanOrEqual(holeDiameter);
  await expect(valueBounds.left).toBeGreaterThanOrEqual(chartBounds.left);
  await expect(valueBounds.right).toBeLessThanOrEqual(chartBounds.right);
  await expect(valueBounds.top).toBeGreaterThanOrEqual(chartBounds.top);
  await expect(valueBounds.bottom).toBeLessThanOrEqual(chartBounds.bottom);
};

export const LongCenterValue: Story = {
  args: {
    label: 'Asset allocation with a ten-character total',
    centerValue: longCenterValue,
  },
  play: expectCenterValueInsideTheRing,
};

export const LongCenterValueNarrow: Story = {
  args: {
    label: 'Asset allocation with a ten-character total in a narrow column',
    centerValue: longCenterValue,
    height: 'sm',
  },
  decorators: [
    (Story) => (
      <div className="w-[180px]">
        <Story />
      </div>
    ),
  ],
  play: expectCenterValueInsideTheRing,
};
