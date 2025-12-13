import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { Button } from '../Button';

import Dialog from '.';

const meta = {
  component: Dialog,
  argTypes: {
    trigger: {
      control: false,
    },
    content: {
      control: false,
    },
    title: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    open: {
      control: 'boolean',
    },
    modal: {
      control: 'boolean',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'components.dialog.description',
      },
      overview: 'components.dialog.overview',
      usage: 'components.dialog.usage',
      accessibility: 'components.dialog.accessibility',
      doList: 'components.dialog.doList',
      dontList: 'components.dialog.dontList',
      relatedComponents: 'components.dialog.relatedComponents',
      dependencies: 'components.dialog.dependencies',
      references: 'components.dialog.references',
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: <Button>Open Dialog</Button>,
    title: 'Dialog Title',
    description: 'This is a description of the dialog content.',
    content: (
      <div className="flex flex-col gap-normal">
        <p>Dialog content goes here. Add forms, information, or any interactive elements.</p>
        <div className="flex justify-end gap-condensed">
          <Button variant="outline" color="dark">
            Cancel
          </Button>
          <Button>Confirm</Button>
        </div>
      </div>
    ),
  },
};

export const WithoutTitle: Story = {
  args: {
    trigger: <Button variant="outline">Open Simple Dialog</Button>,
    content: (
      <div className="flex flex-col gap-normal">
        <p>A dialog without a visible title. The title is hidden but still accessible to screen readers.</p>
        <Button>Close</Button>
      </div>
    ),
  },
};

export const FormDialog: Story = {
  args: {
    trigger: <Button color="accent">Edit Profile</Button>,
    title: 'Edit Profile',
    description: 'Update your profile information below.',
    content: (
      <form className="flex flex-col gap-normal">
        <div className="flex flex-col gap-condensed">
          <label htmlFor="name" className="text-body-r-sm font-bold">
            Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            className="border rounded-lg px-3 py-2"
          />
        </div>
        <div className="flex flex-col gap-condensed">
          <label htmlFor="email" className="text-body-r-sm font-bold">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="border rounded-lg px-3 py-2"
          />
        </div>
        <div className="flex justify-end gap-condensed">
          <Button variant="outline" color="dark" type="button">
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    ),
  },
};

export const ConfirmationDialog: Story = {
  args: {
    trigger: <Button color="error">Delete Item</Button>,
    title: 'Delete Item',
    description: 'Are you sure you want to delete this item? This action cannot be undone.',
    content: (
      <div className="flex justify-end gap-condensed">
        <Button variant="outline" color="dark">
          Cancel
        </Button>
        <Button color="error">Delete</Button>
      </div>
    ),
  },
};
