import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn } from 'storybook/test';

import { PeriodSelector } from '.';

const meta = {
  component: PeriodSelector,
  args: {
    label: 'August 2026',
    previousLabel: 'Previous month',
    nextLabel: 'Next month',
    onPrevious: fn(),
    onNext: fn(),
  },
  argTypes: {
    previousDisabled: { control: 'boolean' },
    nextDisabled: { control: 'boolean' },
  },
  play: async ({ args, canvas, userEvent }) => {
    const next = canvas.getByRole('button', { name: args.nextLabel });

    await userEvent.click(next);

    await expect(args.onNext).toHaveBeenCalledTimes(1);
  },
  parameters: {
    docs: {
      description: {
        component: 'components.periodSelector.description',
      },
      overview: 'components.periodSelector.overview',
      usage: 'components.periodSelector.usage',
      accessibility: 'components.periodSelector.accessibility',
      doList: 'components.periodSelector.doList',
      dontList: 'components.periodSelector.dontList',
      relatedComponents: 'components.periodSelector.relatedComponents',
      dependencies: 'components.periodSelector.dependencies',
      references: 'components.periodSelector.references',
    },
  },
} satisfies Meta<typeof PeriodSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AtLatestPeriod: Story = {
  args: {
    nextDisabled: true,
  },
  play: async ({ args, canvas }) => {
    const next = canvas.getByRole('button', { name: args.nextLabel });

    await expect(next).toBeDisabled();
  },
};

export const AtEarliestPeriod: Story = {
  args: {
    label: 'January 2024',
    previousDisabled: true,
  },
  play: async ({ args, canvas }) => {
    const previous = canvas.getByRole('button', { name: args.previousLabel });

    await expect(previous).toBeDisabled();
  },
};

const monthLabels = ['June 2026', 'July 2026', 'August 2026'];

function SteppingPeriodSelector() {
  const [monthIndex, setMonthIndex] = useState(monthLabels.length - 1);

  return (
    <PeriodSelector
      label={monthLabels[monthIndex]}
      previousLabel="Previous month"
      nextLabel="Next month"
      previousDisabled={monthIndex === 0}
      nextDisabled={monthIndex === monthLabels.length - 1}
      onPrevious={() => setMonthIndex((index) => index - 1)}
      onNext={() => setMonthIndex((index) => index + 1)}
    />
  );
}

export const Stepping: Story = {
  render: () => <SteppingPeriodSelector />,
  play: async ({ canvas, userEvent }) => {
    const previous = canvas.getByRole('button', { name: 'Previous month' });

    await userEvent.click(previous);

    await expect(canvas.getByText('July 2026')).toBeInTheDocument();
  },
};
