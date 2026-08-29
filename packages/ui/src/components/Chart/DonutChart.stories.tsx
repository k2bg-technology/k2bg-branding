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
