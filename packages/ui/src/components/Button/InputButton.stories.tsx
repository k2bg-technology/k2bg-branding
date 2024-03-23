import type { Meta, StoryObj } from '@storybook/react';

import InputButton from './InputButton';

const meta = {
  component: InputButton,
  parameters: {},
  tags: ['autodocs'],
} satisfies Meta<typeof InputButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: 'submit',
    value: '送信',
  },
};
