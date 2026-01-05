import type { Meta, StoryObj } from '@storybook/nextjs';

import HatenaShareButton from './HatenaShareButton';

const meta: Meta<typeof HatenaShareButton> = {
  title: 'HatenaShareButton',
  component: HatenaShareButton,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
