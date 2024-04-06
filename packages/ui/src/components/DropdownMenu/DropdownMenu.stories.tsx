import type { Meta, StoryObj } from '@storybook/react';

import { Icon } from '../Icon';
import { Button } from '../Button';

import DropdownMenu from './DropdownMenu';
import DropdownMenuItem from './DropdownMenuItem';

const meta = {
  component: DropdownMenu,
  tags: ['autodocs'],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <DropdownMenuItem>
          <a href="https://example.com" target="blank">
            メニュー1
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a href="https://example.com" target="blank">
            メニュー2
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a href="https://example.com" target="blank">
            メニュー3
          </a>
        </DropdownMenuItem>
      </>
    ),
    trigger: (
      <span>
        <Button color="dark" variant="text">
          <Icon name="inbox-stack" className="w-10 h-10" />
        </Button>
      </span>
    ),
  },
};
