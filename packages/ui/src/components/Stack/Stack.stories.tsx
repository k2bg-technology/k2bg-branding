import type { Meta, StoryObj } from '@storybook/react';

import Stack from './Stack';

const meta: Meta<typeof Stack> = {
  component: Stack,
  args: {
    children: (
      <>
        <div className="size-6 bg-main-default" />
        <div className="size-6 bg-main-default" />
        <div className="size-6 bg-main-default" />
      </>
    ),
    gap: 'normal',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Row: Story = {
  args: {
    direction: 'row',
  },
};

export const Column: Story = {
  args: {
    direction: 'column',
  },
};
