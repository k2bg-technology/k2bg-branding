import type { Meta, StoryObj } from '@storybook/react';

import { Icon } from '../Icon';

import Button from './Button';

const meta = {
  component: Button,
  parameters: {},
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
    onClick: () => alert('Clicked!'),
  },
};

export const IconButton: Story = {
  args: {
    children: <Icon name="bars-3" />,
    color: 'dark',
    variant: 'text',
    onClick: () => alert('Clicked!'),
  },
};
