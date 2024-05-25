import type { Meta, StoryObj } from '@storybook/react';

import { Icon } from '../../../..';
import Form from '..';

const meta: Meta<typeof Form.Input> = {
  component: Form.Input,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Error: Story = {
  args: {
    error: true,
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: '検索',
    startAdornment: <Icon name="magnifying-glass" width={20} height={20} />,
  },
};
