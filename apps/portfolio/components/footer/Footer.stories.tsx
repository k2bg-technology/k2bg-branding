import type { Meta, StoryObj } from '@storybook/nextjs';

import { Footer } from './Footer';

const meta: Meta<typeof Footer> = {
  component: Footer,
  args: {
    lng: 'ja',
  },
};

export default meta;

type Story = StoryObj<typeof Footer>;

export const Default: Story = {};
