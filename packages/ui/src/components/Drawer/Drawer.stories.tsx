import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { Button } from '../Button';

import Drawer from './Drawer';

const meta = {
  component: Drawer,
  args: {
    trigger: <Button>Open Drawer</Button>,
  },
  parameters: {
    docs: {
      description: {
        component: 'components.drawer.description',
      },
      overview: 'components.drawer.overview',
      usage: 'components.drawer.usage',
      accessibility: 'components.drawer.accessibility',
      doList: 'components.drawer.doList',
      dontList: 'components.drawer.dontList',
      relatedComponents: 'components.drawer.relatedComponents',
      dependencies: 'components.drawer.dependencies',
      references: 'components.drawer.references',
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Drawer Title',
    description: 'This is a description of the drawer content.',
    mainContent: (
      <div className="space-y-4">
        <p>Main content goes here.</p>
        <p>You can add any content you need.</p>
      </div>
    ),
  },
};

export const WithoutDescription: Story = {
  args: {
    title: 'Simple Drawer',
    mainContent: (
      <div className="space-y-4">
        <p>This drawer has no description.</p>
      </div>
    ),
  },
};

export const WithComplexContent: Story = {
  args: {
    trigger: <Button color="accent">Open Complex Drawer</Button>,
    title: 'Settings',
    description: 'Configure your preferences',
    mainContent: (
      <div className="space-y-6 w-80">
        <div className="space-y-2">
          <h3 className="font-semibold">General</h3>
          <div className="space-y-1">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span>Enable notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span>Auto-save changes</span>
            </label>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Display</h3>
          <div className="space-y-1">
            <label className="flex items-center gap-2">
              <input type="radio" name="theme" />
              <span>Light mode</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="theme" />
              <span>Dark mode</span>
            </label>
          </div>
        </div>
        <Button className="w-full">Save Settings</Button>
      </div>
    ),
  },
};

