import type { Meta, StoryObj } from '@storybook/nextjs';

import { Search } from './Search';

const meta: Meta<typeof Search> = {
  title: 'Search',
  component: Search,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
