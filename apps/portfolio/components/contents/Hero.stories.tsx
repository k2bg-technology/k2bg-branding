import type { Meta, StoryObj } from '@storybook/nextjs';

import { Hero } from './Hero';

const meta: Meta<typeof Hero> = {
  component: Hero,
  args: {
    lng: 'ja',
  },
};

export default meta;

type Story = StoryObj<typeof Hero>;

export const Default: Story = {};
