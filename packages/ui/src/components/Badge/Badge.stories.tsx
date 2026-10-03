import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from '../Icon';

import { Badge } from '.';

const colors = [
  'main',
  'accent',
  'inherit',
  'success',
  'info',
  'error',
  'warning',
  'dark',
  'light',
] as const;

const variants = ['default', 'outline'] as const;

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

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-spacious p-4">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-normal">
          {colors.map((color) => (
            <span
              key={`${variant}-${color}`}
              className={`rounded-md p-2 ${
                color === 'light' ? 'bg-base-black' : 'bg-base-white'
              }`}
            >
              <Badge variant={variant} color={color}>
                {color}
              </Badge>
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
};

// Regression coverage for the `render` prop: the rendered element must keep
// the label passed as its own children.
// @see https://github.com/k2bg-technology/k2bg-branding/issues/265
export const RenderLink: Story = {
  args: {
    render: (
      <a href="https://example.com" target="_blank" rel="noopener noreferrer">
        Render Link
      </a>
    ),
  },
};
