import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatTile, StatTileSentiment, StatTileTrend } from '.';

const meta = {
  component: StatTile,
  args: {
    label: 'Portfolio value',
    value: '¥12,480,000',
    delta: { label: '+3.2%', trend: StatTileTrend.UP },
    description: 'vs. previous month',
  },
  argTypes: {
    value: { control: 'text' },
    description: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component: 'components.statTile.description',
      },
      overview: 'components.statTile.overview',
      usage: 'components.statTile.usage',
      accessibility: 'components.statTile.accessibility',
      doList: 'components.statTile.doList',
      dontList: 'components.statTile.dontList',
      relatedComponents: 'components.statTile.relatedComponents',
      dependencies: 'components.statTile.dependencies',
      references: 'components.statTile.references',
    },
  },
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Down: Story = {
  args: {
    label: 'Monthly expenses',
    value: '¥312,400',
    delta: { label: '-8.1%', trend: StatTileTrend.DOWN },
  },
};

export const Flat: Story = {
  args: {
    label: 'Dividend yield',
    value: '3.4%',
    delta: { label: '±0.0pt', trend: StatTileTrend.FLAT },
    description: 'Trailing twelve months',
  },
};

export const ExpenseDown: Story = {
  args: {
    label: 'Monthly expenses',
    value: '¥312,400',
    delta: {
      label: '-8.1%',
      trend: StatTileTrend.DOWN,
      sentiment: StatTileSentiment.POSITIVE,
    },
    description: 'vs. previous month',
  },
};

export const ValueOnly: Story = {
  args: {
    label: 'Dividends received',
    value: '¥48,200',
    delta: undefined,
    description: undefined,
  },
};

export const Row: Story = {
  render: (args) => (
    <div className="grid gap-spacious sm:grid-cols-2 lg:grid-cols-4">
      <StatTile {...args} />
      <StatTile
        label="Period return"
        value="+2.8%"
        delta={{ label: '+1.1pt', trend: StatTileTrend.UP }}
        description="vs. previous month"
      />
      <StatTile
        label="Monthly expenses"
        value="¥312,400"
        delta={{
          label: '-8.1%',
          trend: StatTileTrend.DOWN,
          sentiment: StatTileSentiment.POSITIVE,
        }}
        description="vs. previous month"
      />
      <StatTile
        label="Overall yield"
        value="3.4%"
        delta={{ label: '±0.0pt', trend: StatTileTrend.FLAT }}
        description="Trailing twelve months"
      />
    </div>
  ),
};
