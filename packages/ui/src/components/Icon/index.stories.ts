import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { ICON_NAMES } from './const';

import { Icon } from './index';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  component: Icon,
  args: {
    name: 'x-mark',
  },
  argTypes: {
    name: {
      control: 'select',
      options: ICON_NAMES,
      table: {
        type: { summary: ICON_NAMES.join(' | ') },
      },
    },
    appearance: {
      control: 'select',
      options: ['outline', 'solid'],
      table: {
        type: { summary: 'outline | solid' },
      },
    },
    originalColor: {
      control: 'boolean',
      options: [true, false],
    },
  },
  parameters: {},
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithColor: Story = {
  args: {
    color: 'var(--color-main-default)',
  },
};

export const WithOriginalColor: Story = {
  args: {
    name: 'figma',
    originalColor: true,
  },
};

export const WithSpecificSize: Story = {
  args: {
    width: 48,
    height: 48,
  },
};
