import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { Icon } from '../Icon';

import { Skelton } from '.';

const meta = {
  component: Skelton,
  parameters: {
    docs: {
      description: {
        component: 'components.skelton.description',
      },
      overview: 'components.skelton.overview',
      usage: 'components.skelton.usage',
      accessibility: 'components.skelton.accessibility',
      doList: 'components.skelton.doList',
      dontList: 'components.skelton.dontList',
      relatedComponents: 'components.skelton.relatedComponents',
      dependencies: 'components.skelton.dependencies',
      references: 'components.skelton.references',
    },
  },
} satisfies Meta<typeof Skelton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Skelton>
      <div className="flex flex-col gap-spacious">
        <Skelton.Box>
          <Icon
            name="photo"
            color="var(--color-base-white)"
            width={30}
            height={30}
          />
        </Skelton.Box>
        <div className="flex gap-spacious">
          <Skelton.Round>
            <Icon
              name="user"
              appearance="solid"
              color="var(--color-base-white)"
              width={20}
              height={20}
            />
          </Skelton.Round>
          <div className="flex flex-col gap-normal w-full">
            <Skelton.Line className="py-normal max-w-96" />
            <Skelton.Line />
            <Skelton.Line />
            <Skelton.Line />
          </div>
        </div>
      </div>
    </Skelton>
  ),
};

export const Lines: Story = {
  render: () => (
    <Skelton>
      <div className="flex flex-col gap-normal w-64">
        <Skelton.Line className="py-1 w-3/4" />
        <Skelton.Line className="py-0.5" />
        <Skelton.Line className="py-0.5" />
        <Skelton.Line className="py-0.5 w-1/2" />
      </div>
    </Skelton>
  ),
};

export const Box: Story = {
  render: () => (
    <Skelton>
      <div className="w-64">
        <Skelton.Box className="py-20">
          <Icon
            name="photo"
            color="var(--color-base-white)"
            width={40}
            height={40}
          />
        </Skelton.Box>
      </div>
    </Skelton>
  ),
};

export const Round: Story = {
  render: () => (
    <Skelton>
      <div className="flex gap-normal">
        <Skelton.Round className="w-8 h-8" />
        <Skelton.Round className="w-10 h-10" />
        <Skelton.Round className="w-12 h-12" />
      </div>
    </Skelton>
  ),
};

export const CardLayout: Story = {
  render: () => (
    <Skelton>
      <div className="w-72 p-4 border border-gray-200 rounded-lg">
        <Skelton.Box className="py-16 mb-4">
          <Icon
            name="photo"
            color="var(--color-base-white)"
            width={24}
            height={24}
          />
        </Skelton.Box>
        <div className="flex flex-col gap-2">
          <Skelton.Line className="py-1 w-3/4" />
          <Skelton.Line className="py-0.5" />
          <Skelton.Line className="py-0.5 w-2/3" />
        </div>
      </div>
    </Skelton>
  ),
};

export const ListWithAvatars: Story = {
  render: () => (
    <Skelton>
      <div className="flex flex-col gap-4 w-80">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skelton.Round className="w-10 h-10" />
            <div className="flex flex-col gap-1 flex-1">
              <Skelton.Line className="py-0.5 w-1/2" />
              <Skelton.Line className="py-0.5 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </Skelton>
  ),
};
