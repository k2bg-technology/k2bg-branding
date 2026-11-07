import type { Meta, StoryObj } from '@storybook/nextjs';

import { FacebookShareLink } from './FacebookShareLink';

const meta: Meta<typeof FacebookShareLink> = {
  title: 'FacebookShareLink',
  component: FacebookShareLink,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
