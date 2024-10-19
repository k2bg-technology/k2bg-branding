import type { Meta, StoryObj } from '@storybook/react';

import Avatar from '.';

const meta: Meta<typeof Avatar> = {
  component: Avatar,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Image: Story = {
  args: {
    children: (
      <Avatar.Image
        alt="Office"
        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=2080&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />
    ),
  },
};

export const Fallback: Story = {
  args: {
    children: <Avatar.Fallback>J</Avatar.Fallback>,
  },
};
