import type { Meta, StoryObj } from '@storybook/react';

import Form from '..';

const meta: Meta<typeof Form.HelperText> = {
  component: Form.HelperText,
  args: {
    children: '補足テキスト',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Error: Story = {
  args: {
    error: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
