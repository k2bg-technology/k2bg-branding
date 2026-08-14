import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from '../Icon';

import { Skeleton } from '.';

const meta = {
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component: 'components.skeleton.description',
      },
      overview: 'components.skeleton.overview',
      usage: 'components.skeleton.usage',
      accessibility: 'components.skeleton.accessibility',
      doList: 'components.skeleton.doList',
      dontList: 'components.skeleton.dontList',
      relatedComponents: 'components.skeleton.relatedComponents',
      dependencies: 'components.skeleton.dependencies',
      references: 'components.skeleton.references',
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Skeleton>
      <div className="flex flex-col gap-spacious">
        <Skeleton.Box>
          <Icon
            name="photo"
            color="var(--color-base-white)"
            width={30}
            height={30}
          />
        </Skeleton.Box>
        <div className="flex gap-spacious">
          <Skeleton.Round>
            <Icon
              name="user"
              appearance="solid"
              color="var(--color-base-white)"
              width={20}
              height={20}
            />
          </Skeleton.Round>
          <div className="flex flex-col gap-normal w-full">
            <Skeleton.Line className="py-normal max-w-96" />
            <Skeleton.Line />
            <Skeleton.Line />
            <Skeleton.Line />
          </div>
        </div>
      </div>
    </Skeleton>
  ),
};

export const Lines: Story = {
  render: () => (
    <Skeleton>
      <div className="flex flex-col gap-normal w-64">
        <Skeleton.Line className="py-1 w-3/4" />
        <Skeleton.Line className="py-0.5" />
        <Skeleton.Line className="py-0.5" />
        <Skeleton.Line className="py-0.5 w-1/2" />
      </div>
    </Skeleton>
  ),
};

export const Box: Story = {
  render: () => (
    <Skeleton>
      <div className="w-64">
        <Skeleton.Box className="py-20">
          <Icon
            name="photo"
            color="var(--color-base-white)"
            width={40}
            height={40}
          />
        </Skeleton.Box>
      </div>
    </Skeleton>
  ),
};

export const Round: Story = {
  render: () => (
    <Skeleton>
      <div className="flex gap-normal">
        <Skeleton.Round className="w-8 h-8" />
        <Skeleton.Round className="w-10 h-10" />
        <Skeleton.Round className="w-12 h-12" />
      </div>
    </Skeleton>
  ),
};

export const CardLayout: Story = {
  render: () => (
    <Skeleton>
      <div className="w-72 p-4 border border-gray-200 rounded-lg">
        <Skeleton.Box className="py-16 mb-4">
          <Icon
            name="photo"
            color="var(--color-base-white)"
            width={24}
            height={24}
          />
        </Skeleton.Box>
        <div className="flex flex-col gap-2">
          <Skeleton.Line className="py-1 w-3/4" />
          <Skeleton.Line className="py-0.5" />
          <Skeleton.Line className="py-0.5 w-2/3" />
        </div>
      </div>
    </Skeleton>
  ),
};

export const ListWithAvatars: Story = {
  render: () => (
    <Skeleton>
      <div className="flex flex-col gap-4 w-80">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton.Round className="w-10 h-10" />
            <div className="flex flex-col gap-1 flex-1">
              <Skeleton.Line className="py-0.5 w-1/2" />
              <Skeleton.Line className="py-0.5 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </Skeleton>
  ),
};
