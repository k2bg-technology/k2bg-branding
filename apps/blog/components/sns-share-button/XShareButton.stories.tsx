import type { Meta, StoryObj } from '@storybook/nextjs';

import { XShareButton } from './XShareButton';

const meta: Meta<typeof XShareButton> = {
  title: 'XShareButton',
  component: XShareButton,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
