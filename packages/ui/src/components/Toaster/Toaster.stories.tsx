import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { type ToasterProps, toast } from 'sonner';

import { Button } from '../Button';

import { Toaster } from './Toaster';

const meta = {
  component: Toaster,
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'components.toaster.description',
      },
      overview: 'components.toaster.overview',
      usage: 'components.toaster.usage',
      accessibility: 'components.toaster.accessibility',
      doList: 'components.toaster.doList',
      dontList: 'components.toaster.dontList',
      relatedComponents: 'components.toaster.relatedComponents',
      dependencies: 'components.toaster.dependencies',
      references: 'components.toaster.references',
    },
  },
  // NOTE: Omit toastOptions/icons to avoid leaking Sonner's internal types into Storybook meta.
} satisfies Meta<Omit<ToasterProps, 'toastOptions' | 'icons'>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Button
      type="button"
      onClick={() =>
        toast('Default notification', {
          closeButton: true,
        })
      }
    >
      Show default toast
    </Button>
  ),
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button');

    await userEvent.click(button);
  },
};

export const Success: Story = {
  render: () => (
    <Button
      type="button"
      color="success"
      onClick={() =>
        toast.success('Operation completed successfully', {
          closeButton: true,
        })
      }
    >
      Show success toast
    </Button>
  ),
  play: Default.play,
};

export const Info: Story = {
  render: () => (
    <Button
      type="button"
      color="info"
      onClick={() =>
        toast.info('Here is some helpful information', {
          closeButton: true,
        })
      }
    >
      Show info toast
    </Button>
  ),
  play: Default.play,
};

export const Warning: Story = {
  render: () => (
    <Button
      type="button"
      color="warning"
      onClick={() =>
        toast.warning('Please review before continuing', {
          closeButton: true,
        })
      }
    >
      Show warning toast
    </Button>
  ),
  play: Default.play,
};

export const Error: Story = {
  render: () => (
    <Button
      type="button"
      color="error"
      onClick={() =>
        toast.error('An error occurred while processing', {
          closeButton: true,
        })
      }
    >
      Show error toast
    </Button>
  ),
  play: Default.play,
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button type="button" onClick={() => toast('Default notification')}>
        Default
      </Button>
      <Button
        type="button"
        color="success"
        onClick={() => toast.success('Success message')}
      >
        Success
      </Button>
      <Button
        type="button"
        color="info"
        onClick={() => toast.info('Info message')}
      >
        Info
      </Button>
      <Button
        type="button"
        color="warning"
        onClick={() => toast.warning('Warning message')}
      >
        Warning
      </Button>
      <Button
        type="button"
        color="error"
        onClick={() => toast.error('Error message')}
      >
        Error
      </Button>
    </div>
  ),
};
