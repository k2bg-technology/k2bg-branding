import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Button } from '../Button';

import { Popover } from '.';

// `text-slate-500` below is decorative demo copy only (not real component
// styling) and has no reasonable base-* token match; kept as-is.

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

    await expect(
      within(document.body).findByText('Set the dimensions for the layer.')
    ).resolves.toBeVisible();
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Popover.Trigger
          render={
            <Button color="dark" variant="outline">
              Open Popover
            </Button>
          }
        />
        <Popover.Positioner>
          <Popover.Popup>
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Dimensions</h4>
                <p className="text-sm text-slate-500">
                  Set the dimensions for the layer.
                </p>
              </div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </>
    ),
  },
};

export const WithForm: Story = {
  args: {
    children: (
      <>
        <Popover.Trigger
          render={
            <Button color="dark" variant="outline">
              Open Popover
            </Button>
          }
        />
        <Popover.Positioner>
          <Popover.Popup className="w-80">
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
          </Popover.Popup>
        </Popover.Positioner>
      </>
    ),
  },
};

export const Dark: Story = {
  args: {
    children: (
      <>
        <Popover.Trigger
          render={
            <Button color="dark" variant="outline">
              Open Popover
            </Button>
          }
        />
        <Popover.Positioner>
          <Popover.Popup color="dark">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Dimensions</h4>
                <p className="text-sm text-base-white/60">
                  Set the dimensions for the layer.
                </p>
              </div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </>
    ),
  },
};

export const DarkWithForm: Story = {
  args: {
    children: (
      <>
        <Popover.Trigger
          render={
            <Button color="dark" variant="outline">
              Open Popover
            </Button>
          }
        />
        <Popover.Positioner>
          <Popover.Popup color="dark" className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Dimensions</h4>
                <p className="text-sm text-base-white/60">
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
                    className="col-span-2 h-8 rounded-md border border-base-white/30 bg-transparent px-3 text-sm text-base-white placeholder-base-white/50"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="darkMaxWidth" className="text-sm">
                    Max. width
                  </label>
                  <input
                    id="darkMaxWidth"
                    defaultValue="300px"
                    className="col-span-2 h-8 rounded-md border border-base-white/30 bg-transparent px-3 text-sm text-base-white placeholder-base-white/50"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="darkHeight" className="text-sm">
                    Height
                  </label>
                  <input
                    id="darkHeight"
                    defaultValue="25px"
                    className="col-span-2 h-8 rounded-md border border-base-white/30 bg-transparent px-3 text-sm text-base-white placeholder-base-white/50"
                  />
                </div>
              </div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </>
    ),
  },
};

export const AlignStart: Story = {
  args: {
    children: (
      <>
        <Popover.Trigger
          render={
            <Button color="dark" variant="outline">
              Align Start
            </Button>
          }
        />
        <Popover.Positioner align="start">
          <Popover.Popup>
            <p className="text-sm">
              This popover is aligned to the start of the trigger.
            </p>
          </Popover.Popup>
        </Popover.Positioner>
      </>
    ),
  },
};

export const AlignEnd: Story = {
  args: {
    children: (
      <>
        <Popover.Trigger
          render={
            <Button color="dark" variant="outline">
              Align End
            </Button>
          }
        />
        <Popover.Positioner align="end">
          <Popover.Popup>
            <p className="text-sm">
              This popover is aligned to the end of the trigger.
            </p>
          </Popover.Popup>
        </Popover.Positioner>
      </>
    ),
  },
};
