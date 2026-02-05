import type { Meta, StoryObj } from '@storybook/nextjs';

import { Header } from './Header';

const meta: Meta<typeof Header> = {
  title: 'Header',
  component: Header,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
