import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button';

import Drawer from './Drawer';

const meta = {
  component: Drawer,
  tags: ['autodocs'],
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: <Button>Open</Button>,
    title: 'dialog title',
    description: 'dialog title description',
    mainContent: <div className="bg-slate-400 w-[30rem] h-full">Content</div>,
  },
};
