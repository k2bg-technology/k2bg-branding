import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { Icon } from '../Icon';

import { Button } from './Button';

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
    asChild: {
      control: 'boolean',
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

export const ExternalLinkButton: Story = {
  args: {
    children: (
      <a href="https://example.com" target="_blank" rel="noopener noreferrer">
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
    asChild: true,
  },
};

export const InputButton: Story = {
  args: {
    children: <input type="submit" value="submit" className="cursor-pointer" />,
    asChild: true,
  },
};
