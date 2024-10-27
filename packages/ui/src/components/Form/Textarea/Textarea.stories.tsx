import type { Meta, StoryObj } from '@storybook/react';

import Form from '..';

const meta: Meta<typeof Form.Textarea> = {
  component: Form.Textarea,
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
