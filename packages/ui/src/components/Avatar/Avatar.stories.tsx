import type { Meta, StoryObj } from '@storybook/react-webpack5';

import AvatarImage from '../../assets/avatar.png';

import Avatar from '.';

const meta = {
  component: Avatar,
  args: {
    className: 'h-8 w-8',
  },
  parameters: {
    docs: {
      description: {
        component: 'components.avatar.description',
      },
      overview: 'components.avatar.overview',
      usage: 'components.avatar.usage',
      accessibility: 'components.avatar.accessibility',
      doList: 'components.avatar.doList',
      dontList: 'components.avatar.dontList',
      relatedComponents: 'components.avatar.relatedComponents',
      dependencies: 'components.avatar.dependencies',
      references: 'components.avatar.references',
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <Avatar.Image alt="User profile" src={AvatarImage} />,
  },
};

export const WithFallback: Story = {
  args: {
    children: <Avatar.Fallback>JD</Avatar.Fallback>,
  },
};

export const WithImageAndFallback: Story = {
  args: {
    children: (
      <>
        <Avatar.Image alt="User profile" src={AvatarImage} />
        <Avatar.Fallback>JD</Avatar.Fallback>
      </>
    ),
  },
};

export const Small: Story = {
  args: {
    className: 'h-6 w-6',
    children: <Avatar.Image alt="User profile" src={AvatarImage} />,
  },
};

export const Large: Story = {
  args: {
    className: 'h-12 w-12',
    children: <Avatar.Image alt="User profile" src={AvatarImage} />,
  },
};
