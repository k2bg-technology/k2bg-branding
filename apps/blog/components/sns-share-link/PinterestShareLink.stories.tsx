import type { Meta, StoryObj } from '@storybook/nextjs';

import { PinterestShareLink } from './PinterestShareLink';

const meta: Meta<typeof PinterestShareLink> = {
  title: 'PinterestShareLink',
  component: PinterestShareLink,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
