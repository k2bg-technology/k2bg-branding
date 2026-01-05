import type { Meta, StoryObj } from '@storybook/nextjs';

import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Pagination',
  component: Pagination,
  args: {
    count: 10,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
