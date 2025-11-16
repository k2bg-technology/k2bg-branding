import type { Meta, StoryObj } from '@storybook/react-webpack5';

import Form from '.';

const meta: Meta<typeof Form.Control> = {
  component: Form.Control,
  args: {
    children: (
      <div className="flex flex-col gap-normal">
        <Form.Label>ラベル</Form.Label>
        <Form.Input />
        <Form.HelperText>補足テキスト</Form.HelperText>
      </div>
    ),
  },
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

export const Light: Story = {
  args: {
    color: 'light',
  },
};
