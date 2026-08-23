import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { BarChart, ChartColor } from '.';

const weekdayCategories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const meta = {
  component: BarChart,
  args: {
    label: 'Energy consumption per day of week',
    categories: weekdayCategories,
    series: [
      {
        id: 'energy',
        label: 'Energy',
        values: [12.4, 11.8, 13.2, 12.9, 14.1, 16.8, 15.4],
      },
    ],
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
        component: 'components.barChart.description',
      },
      overview: 'components.barChart.overview',
      usage: 'components.barChart.usage',
      accessibility: 'components.barChart.accessibility',
      doList: 'components.barChart.doList',
      dontList: 'components.barChart.dontList',
      relatedComponents: 'components.barChart.relatedComponents',
      dependencies: 'components.barChart.dependencies',
      references: 'components.barChart.references',
    },
  },
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Grouped: Story = {
  args: {
    label: 'Energy consumption per room and day of week',
    series: [
      {
        id: 'livingRoom',
        label: 'Living room',
        values: [5.2, 4.8, 5.6, 5.3, 6.1, 7.4, 6.8],
      },
      {
        id: 'kitchen',
        label: 'Kitchen',
        values: [4.1, 3.9, 4.5, 4.3, 4.8, 5.9, 5.2],
      },
      {
        id: 'bedroom',
        label: 'Bedroom',
        values: [3.1, 3.1, 3.1, 3.3, 3.2, 3.5, 3.4],
      },
    ],
  },
};

export const StatusColors: Story = {
  args: {
    label: 'Sleep quality per day of week',
    series: [
      {
        id: 'deepSleep',
        label: 'Deep sleep (good)',
        color: ChartColor.SUCCESS,
        values: [2.1, 1.9, 2.3, 2.0, 1.8, 2.6, 2.4],
      },
      {
        id: 'restless',
        label: 'Restless (warning)',
        color: ChartColor.WARNING,
        values: [0.8, 1.1, 0.6, 0.9, 1.3, 0.4, 0.5],
      },
    ],
  },
};

export const FormattedValues: Story = {
  args: {
    label: 'Energy consumption per day of week in kilowatt hours',
    valueFormatter: (value: number) => `${value}kWh`,
  },
};
