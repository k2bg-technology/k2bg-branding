import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button';

import Dialog from './Dialog';

const meta = {
  component: Dialog,
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: <Button>Open</Button>,
    title: 'dialog title',
    description: 'dialog title description',
    content: <div className="bg-slate-400 h-full">Content</div>,
  },
};
