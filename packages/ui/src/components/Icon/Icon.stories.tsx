import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { HERO_ICON_NAMES, ICON_NAMES, MULTI_COLOR_ICON_NAMES } from './const';

import { Icon } from '.';

const meta = {
  component: Icon,
  args: {
    name: 'arrow-right',
  },
  argTypes: {
    name: {
      control: 'select',
      options: ICON_NAMES,
    },
    appearance: {
      control: 'select',
      options: ['outline', 'solid'],
    },
    color: {
      control: 'color',
    },
    width: {
      control: 'number',
    },
    height: {
      control: 'number',
    },
    originalColor: {
      control: 'boolean',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'components.icon.description',
      },
      overview: 'components.icon.overview',
      usage: 'components.icon.usage',
      accessibility: 'components.icon.accessibility',
      doList: 'components.icon.doList',
      dontList: 'components.icon.dontList',
      relatedComponents: 'components.icon.relatedComponents',
      dependencies: 'components.icon.dependencies',
      references: 'components.icon.references',
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'arrow-right',
  },
};

export const Outline: Story = {
  args: {
    name: 'chevron-right',
    appearance: 'outline',
  },
};

export const Solid: Story = {
  args: {
    name: 'check-circle',
    appearance: 'solid',
  },
};

export const CustomColor: Story = {
  args: {
    name: 'information-circle',
    color: '#3b82f6',
  },
};

export const CustomSize: Story = {
  args: {
    name: 'magnifying-glass',
    width: 48,
    height: 48,
  },
};

export const SmallSize: Story = {
  args: {
    name: 'x-mark',
    width: 16,
    height: 16,
  },
};

export const MultiColorIcon: Story = {
  args: {
    name: 'react',
    originalColor: true,
  },
};

export const BrandIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {MULTI_COLOR_ICON_NAMES.map((name) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon name={name} originalColor width={32} height={32} />
          <span className="text-xs">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const HeroIconsOutline: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {HERO_ICON_NAMES.map((name) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon name={name} appearance="outline" width={24} height={24} />
          <span className="text-xs">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const HeroIconsSolid: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {HERO_ICON_NAMES.map((name) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon name={name} appearance="solid" width={24} height={24} />
          <span className="text-xs">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const ColorVariations: Story = {
  render: () => (
    <div className="flex gap-4">
      <Icon name="check-circle" color="var(--color-base-success)" />
      <Icon name="information-circle" color="var(--color-base-info)" />
      <Icon name="exclamation-triangle" color="var(--color-base-warning)" />
      <Icon name="x-circle" color="var(--color-base-error)" />
    </div>
  ),
};
