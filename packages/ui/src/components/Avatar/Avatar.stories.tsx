import type { Meta, StoryObj } from '@storybook/react';

import Avatar from './Avatar';

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  parameters: {},
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    image: (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt="Office"
        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=2080&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />
    ),
    name: 'John Doe',
  },
};
