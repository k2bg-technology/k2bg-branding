import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { Form } from '..';

const meta: Meta<typeof Form.Label> = {
  component: Form.Label,
  args: {
    children: 'ラベル',
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
