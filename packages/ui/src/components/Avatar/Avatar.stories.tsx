import type { Meta, StoryObj } from '@storybook/react';

import AvatarImage from '../../assets/avatar.png';

import Avatar from '.';

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  args: {
    className: 'h-8 w-8',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Image: Story = {
  args: {
    children: <Avatar.Image alt="Office" src={AvatarImage} />,
  },
};

export const Fallback: Story = {
  args: {
    children: <Avatar.Fallback>J</Avatar.Fallback>,
  },
};
