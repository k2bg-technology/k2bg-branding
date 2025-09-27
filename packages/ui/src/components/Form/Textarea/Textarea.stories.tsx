import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

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

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox');

    await userEvent.click(input);
  },
};

export const Error: Story = {
  args: {
    error: true,
  },
};
