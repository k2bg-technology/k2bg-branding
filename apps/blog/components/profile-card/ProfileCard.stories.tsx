import type { Meta, StoryObj } from '@storybook/nextjs';

import ProfileCard from './ProfileCard';

const meta: Meta<typeof ProfileCard> = {
  title: 'ProfileCard',
  component: ProfileCard,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
