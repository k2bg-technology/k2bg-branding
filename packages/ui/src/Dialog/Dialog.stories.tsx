import type { Meta, StoryObj } from '@storybook/react';

import Dialog from './Dialog';

const meta = {
  component: Dialog,
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: (
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-2 shadow-md bg-white py-5 px-10 font-medium leading-none focus:outline-none"
      >
        trigger button
      </button>
    ),
    title: 'dialog title',
    description: 'dialog title description',
    content: <div className="bg-slate-400 h-full">Content</div>,
  },
};
