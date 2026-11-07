import type { Meta, StoryObj } from '@storybook/nextjs';

import { HatenaShareLink } from './HatenaShareLink';

const meta: Meta<typeof HatenaShareLink> = {
  title: 'HatenaShareLink',
  component: HatenaShareLink,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
