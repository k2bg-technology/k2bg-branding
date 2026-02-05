import type { Meta, StoryObj } from '@storybook/nextjs';

import { LineShareButton } from './LineShareButton';

const meta: Meta<typeof LineShareButton> = {
  title: 'LineShareButton',
  component: LineShareButton,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
