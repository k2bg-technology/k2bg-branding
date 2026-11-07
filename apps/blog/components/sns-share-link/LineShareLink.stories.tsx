import type { Meta, StoryObj } from '@storybook/nextjs';

import { LineShareLink } from './LineShareLink';

const meta: Meta<typeof LineShareLink> = {
  title: 'LineShareLink',
  component: LineShareLink,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
