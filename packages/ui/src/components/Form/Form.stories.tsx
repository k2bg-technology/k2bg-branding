import type { Meta, StoryObj } from '@storybook/react';

import Form from '.';

const meta: Meta<typeof Form.Control> = {
  component: Form.Control,
  args: {
    children: (
      <div className="flex flex-col gap-4">
        <Form.Label>ラベル</Form.Label>
        <Form.Input />
        <Form.HelperText>補足テキスト</Form.HelperText>
      </div>
    ),
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
