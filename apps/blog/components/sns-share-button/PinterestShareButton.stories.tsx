import type { Meta, StoryObj } from '@storybook/nextjs';

import { PinterestShareButton } from './PinterestShareButton';

const meta: Meta<typeof PinterestShareButton> = {
  title: 'PinterestShareButton',
  component: PinterestShareButton,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
