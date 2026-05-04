import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { Icon } from '../Icon';

import { Badge } from '.';

const meta = {
  component: Badge,
  args: {
    children: 'Badge',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
    },
    color: {
      control: 'select',
      options: [
        'main',
        'accent',
        'inherit',
        'success',
        'info',
        'error',
        'warning',
        'dark',
        'light',
      ],
    },
    asChild: {
      control: 'boolean',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'components.badge.description',
      },
      overview: 'components.badge.overview',
      usage: 'components.badge.usage',
      accessibility: 'components.badge.accessibility',
      doList: 'components.badge.doList',
      dontList: 'components.badge.dontList',
      relatedComponents: 'components.badge.relatedComponents',
      dependencies: 'components.badge.dependencies',
      references: 'components.badge.references',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Icon
          name="exclamation-triangle"
          width={16}
          height={16}
          color="var(--color-white)"
        />
        Badge
      </>
    ),
    color: 'warning',
  },
};

export const Border: Story = {
  args: {
    children: 'Badge',
    variant: 'outline',
    color: 'error',
  },
};

// Regression coverage for the `asChild` API: the rendered element must keep
// the label that was passed as the child element's children.
// @see https://github.com/k2bg-technology/k2bg-branding/issues/265
export const AsChildLink: Story = {
  args: {
    asChild: true,
    children: (
      <a href="https://example.com" target="_blank" rel="noopener noreferrer">
        AsChild Link
      </a>
    ),
  },
};
