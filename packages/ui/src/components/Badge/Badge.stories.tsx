import type { Meta, StoryObj } from '@storybook/react';

import { Icon } from '../Icon';

import { Badge } from '.';

const meta = {
  component: Badge,
  args: {
    children: 'Badge',
    variant: 'default',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
    },
    color: {
      control: 'select',
      options: [
        'main',
        'accent',
        'inherit',
        'success',
        'info',
        'error',
        'warning',
        'dark',
        'light',
      ],
    },
    asChild: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Icon
          name="exclamation-triangle"
          width={16}
          height={16}
          color="var(--color-white)"
        />
        Badge
      </>
    ),
    color: 'warning',
  },
};

export const Border: Story = {
  args: {
    children: 'Badge',
    variant: 'outline',
    color: 'error',
  },
};
