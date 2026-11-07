import type { Meta, StoryObj } from '@storybook/nextjs';

import { XShareLink } from './XShareLink';

const meta: Meta<typeof XShareLink> = {
  title: 'XShareLink',
  component: XShareLink,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
