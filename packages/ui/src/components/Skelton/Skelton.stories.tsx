import type { Meta, StoryObj } from '@storybook/react';

import { Icon } from '../Icon';

import Skelton from '.';

const meta: Meta<typeof Skelton> = {
  component: Skelton,
};

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
        <div className="flex flex-col gap-spacious">
          <Skelton.Round>
            <Icon
              name="user"
              appearance="solid"
              color="var(--color-base-white)"
              width={20}
              height={20}
            />
          </Skelton.Round>
          <div className="flex flex-col gap-normal">
            <Skelton.Line className="py-normal w-96" />
            <Skelton.Line />
            <Skelton.Line />
            <Skelton.Line />
          </div>
        </div>
      </div>
    </Skelton>
  ),
};
