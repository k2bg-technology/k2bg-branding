import type { Meta, StoryObj } from '@storybook/react';
import { toast } from 'sonner';

import { Button } from '../Button';

import Toaster from './Toaster';

const meta: Meta<typeof Toaster> = {
  component: Toaster,
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Button
      type="button"
      onClick={() =>
        toast.success('メールを送信しました', {
          closeButton: true,
        })
      }
    >
      render toast
    </Button>
  ),
};
