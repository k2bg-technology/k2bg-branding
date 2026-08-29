import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { SankeyChart } from '.';

const thousandYen = (value: number) => `¥${value.toLocaleString('en-US')}k`;

const meta = {
  component: SankeyChart,
  args: {
    label: 'Where a month of income goes',
    nodes: [
      { id: 'income', label: 'Income' },
      { id: 'living', label: 'Living' },
      { id: 'investment', label: 'Investment' },
      { id: 'business', label: 'Business' },
      { id: 'savings', label: 'Savings' },
      { id: 'emergencyFund', label: 'Emergency fund' },
    ],
    links: [
      { source: 'income', target: 'living', value: 320 },
      { source: 'income', target: 'investment', value: 180 },
      { source: 'income', target: 'business', value: 90 },
      { source: 'income', target: 'savings', value: 140 },
      { source: 'savings', target: 'emergencyFund', value: 60 },
    ],
    valueFormatter: thousandYen,
  },
  argTypes: {
    height: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const chart = canvas.getByRole('application', { name: args.label });
    const tooltip = () =>
      canvasElement.querySelector('[data-slot="chart-tooltip"]');
    const nodes = canvasElement.querySelectorAll('.recharts-sankey-node');
    const link = canvasElement.querySelector('.recharts-sankey-link');

    await expect(chart).toBeInTheDocument();
    await expect(nodes).toHaveLength(args.nodes.length);

    // Flows answer to the pointer rather than the keyboard, so hovering is
    // the only way to reach the tooltip.
    await userEvent.hover(nodes[0]);
    await waitFor(() => expect(tooltip()).toBeInTheDocument());
    const nodeTooltipText = tooltip()?.textContent;

    if (link) {
      await userEvent.hover(link);
    }

    await waitFor(() =>
      expect(tooltip()?.textContent).not.toBe(nodeTooltipText)
    );
  },
  parameters: {
    docs: {
      description: {
        component: 'components.sankeyChart.description',
      },
      overview: 'components.sankeyChart.overview',
      usage: 'components.sankeyChart.usage',
      accessibility: 'components.sankeyChart.accessibility',
      doList: 'components.sankeyChart.doList',
      dontList: 'components.sankeyChart.dontList',
      relatedComponents: 'components.sankeyChart.relatedComponents',
      dependencies: 'components.sankeyChart.dependencies',
      references: 'components.sankeyChart.references',
    },
  },
} satisfies Meta<typeof SankeyChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwoLevels: Story = {
  args: {
    label: 'How take-home pay splits in two',
    nodes: [
      { id: 'takeHome', label: 'Take-home pay' },
      { id: 'spent', label: 'Spent' },
      { id: 'kept', label: 'Kept' },
    ],
    links: [
      { source: 'takeHome', target: 'spent', value: 410 },
      { source: 'takeHome', target: 'kept', value: 320 },
    ],
  },
};
