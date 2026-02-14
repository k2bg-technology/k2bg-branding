import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Button } from '../Button';

import { Popover } from '.';

const meta = {
  component: Popover,
  argTypes: {
    children: {
      control: false,
      description: 'The content to display inside the popover',
    },
    open: {
      control: 'boolean',
      description: 'Controlled open state of the popover',
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Default open state for uncontrolled usage',
    },
    modal: {
      control: 'boolean',
      description: 'Whether the popover should behave as a modal',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'components.popover.description',
      },
      overview: 'components.popover.overview',
      usage: 'components.popover.usage',
      accessibility: 'components.popover.accessibility',
      doList: 'components.popover.doList',
      dontList: 'components.popover.dontList',
      relatedComponents: 'components.popover.relatedComponents',
      dependencies: 'components.popover.dependencies',
      references: 'components.popover.references',
    },
  },
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button');

    await userEvent.click(button);
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Popover.Trigger>
          <Button color="dark" variant="outline">
            Open Popover
          </Button>
        </Popover.Trigger>
        <Popover.Content>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Dimensions</h4>
              <p className="text-sm text-slate-500">
                Set the dimensions for the layer.
              </p>
            </div>
          </div>
        </Popover.Content>
      </>
    ),
  },
};

export const WithForm: Story = {
  args: {
    children: (
      <>
        <Popover.Trigger>
          <Button color="dark" variant="outline">
            Open Popover
          </Button>
        </Popover.Trigger>
        <Popover.Content className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Dimensions</h4>
              <p className="text-sm text-slate-500">
                Set the dimensions for the layer.
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <label htmlFor="width" className="text-sm">
                  Width
                </label>
                <input
                  id="width"
                  defaultValue="100%"
                  className="col-span-2 h-8 rounded-md border px-3 text-sm"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <label htmlFor="maxWidth" className="text-sm">
                  Max. width
                </label>
                <input
                  id="maxWidth"
                  defaultValue="300px"
                  className="col-span-2 h-8 rounded-md border px-3 text-sm"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <label htmlFor="height" className="text-sm">
                  Height
                </label>
                <input
                  id="height"
                  defaultValue="25px"
                  className="col-span-2 h-8 rounded-md border px-3 text-sm"
                />
              </div>
            </div>
          </div>
        </Popover.Content>
      </>
    ),
  },
};

export const Dark: Story = {
  args: {
    children: (
      <>
        <Popover.Trigger>
          <Button color="dark" variant="outline">
            Open Popover
          </Button>
        </Popover.Trigger>
        <Popover.Content color="dark">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Dimensions</h4>
              <p className="text-sm text-white/60">
                Set the dimensions for the layer.
              </p>
            </div>
          </div>
        </Popover.Content>
      </>
    ),
  },
};

export const DarkWithForm: Story = {
  args: {
    children: (
      <>
        <Popover.Trigger>
          <Button color="dark" variant="outline">
            Open Popover
          </Button>
        </Popover.Trigger>
        <Popover.Content color="dark" className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Dimensions</h4>
              <p className="text-sm text-white/60">
                Set the dimensions for the layer.
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <label htmlFor="darkWidth" className="text-sm">
                  Width
                </label>
                <input
                  id="darkWidth"
                  defaultValue="100%"
                  className="col-span-2 h-8 rounded-md border border-white/30 bg-transparent px-3 text-sm text-white placeholder-white/50"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <label htmlFor="darkMaxWidth" className="text-sm">
                  Max. width
                </label>
                <input
                  id="darkMaxWidth"
                  defaultValue="300px"
                  className="col-span-2 h-8 rounded-md border border-white/30 bg-transparent px-3 text-sm text-white placeholder-white/50"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <label htmlFor="darkHeight" className="text-sm">
                  Height
                </label>
                <input
                  id="darkHeight"
                  defaultValue="25px"
                  className="col-span-2 h-8 rounded-md border border-white/30 bg-transparent px-3 text-sm text-white placeholder-white/50"
                />
              </div>
            </div>
          </div>
        </Popover.Content>
      </>
    ),
  },
};

export const AlignStart: Story = {
  args: {
    children: (
      <>
        <Popover.Trigger>
          <Button color="dark" variant="outline">
            Align Start
          </Button>
        </Popover.Trigger>
        <Popover.Content align="start">
          <p className="text-sm">
            This popover is aligned to the start of the trigger.
          </p>
        </Popover.Content>
      </>
    ),
  },
};

export const AlignEnd: Story = {
  args: {
    children: (
      <>
        <Popover.Trigger>
          <Button color="dark" variant="outline">
            Align End
          </Button>
        </Popover.Trigger>
        <Popover.Content align="end">
          <p className="text-sm">
            This popover is aligned to the end of the trigger.
          </p>
        </Popover.Content>
      </>
    ),
  },
};
