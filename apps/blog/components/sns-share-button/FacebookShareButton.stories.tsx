import type { Meta, StoryObj } from '@storybook/nextjs';

import { FacebookShareButton } from './FacebookShareButton';

const meta: Meta<typeof FacebookShareButton> = {
  title: 'FacebookShareButton',
  component: FacebookShareButton,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
