import type { Meta, StoryObj } from '@storybook/react';

import Skelton from '.';
import { Icon } from '../Icon';

const meta: Meta<typeof Skelton> = {
  component: Skelton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Skelton className="flex flex-col gap-3">
      <Skelton.Box>
        <Icon
          name="photo"
          color="var(--color-base-white)"
          width={30}
          height={30}
        />
      </Skelton.Box>
      <div className="flex flex-row gap-4">
        <Skelton.Round>
          <Icon
            name="user"
            appearance="solid"
            color="var(--color-base-white)"
            width={20}
            height={20}
          />
        </Skelton.Round>
        <div className="flex justify-center flex-col gap-2 w-full">
          <Skelton.Line className="py-3 w-96" />
          <Skelton.Line />
          <Skelton.Line />
          <Skelton.Line />
        </div>
      </div>
    </Skelton>
  ),
};
