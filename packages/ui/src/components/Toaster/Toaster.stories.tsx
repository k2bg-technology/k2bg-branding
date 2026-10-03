import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ToasterProps, toast } from 'sonner';
import { expect, waitFor, within } from 'storybook/test';

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

/**
 * Each story triggers a different message, so the assertion is built per story
 * rather than shared through one play function.
 */
const createToastPlay =
  (expectedMessage: string): NonNullable<Story['play']> =>
  async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button');

    await userEvent.click(button);

    // Retry the visibility check: Sonner mounts the toast at opacity 0 and
    // fades it in, so a one-shot assertion races the enter animation.
    await waitFor(() =>
      expect(within(document.body).getByText(expectedMessage)).toBeVisible()
    );
  };

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
  play: createToastPlay('Default notification'),
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
  play: createToastPlay('Operation completed successfully'),
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
  play: createToastPlay('Here is some helpful information'),
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
  play: createToastPlay('Please review before continuing'),
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
  play: createToastPlay('An error occurred while processing'),
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
