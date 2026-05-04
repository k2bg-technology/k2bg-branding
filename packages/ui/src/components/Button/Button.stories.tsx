import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { Icon } from '../Icon';

import { Button, buttonVariants } from './Button';

const meta = {
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'ghost'],
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
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'components.button.description',
      },
      overview: 'components.button.overview',
      usage: 'components.button.usage',
      accessibility: 'components.button.accessibility',
      doList: 'components.button.doList',
      dontList: 'components.button.dontList',
      relatedComponents: 'components.button.relatedComponents',
      dependencies: 'components.button.dependencies',
      references: 'components.button.references',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const IconButton: Story = {
  args: {
    children: <Icon name="bars-3" />,
    color: 'dark',
    variant: 'ghost',
    size: 'icon',
  },
};

// Renders as a real `<a>` so that link semantics are preserved.
// Apply `buttonVariants` directly instead of going through the Button
// component, because Base UI's Button overrides link semantics with
// `role="button"` when used with a non-button render target.
export const ExternalLinkButton: Story = {
  render: () => (
    <a
      href="https://example.com"
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({ color: 'main' })}
    >
      <span className="flex gap-condensed">
        <Icon
          name="arrow-top-right-on-square"
          color="var(--color-base-white)"
          width={14}
          height={14}
        />
        External Link
      </span>
    </a>
  ),
};

// Renders as `<input type="submit">` for form submissions where a real
// `<button type="submit">` cannot be used. Apply `buttonVariants` directly
// to keep native input semantics.
export const InputButton: Story = {
  render: () => (
    <input
      type="submit"
      value="submit"
      className={buttonVariants({ color: 'main' })}
    />
  ),
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
