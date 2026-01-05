import type { Meta, StoryObj } from '@storybook/nextjs';

import { ScrollHelper } from './ScrollHelper';

const meta: Meta<typeof ScrollHelper> = {
  component: ScrollHelper,
};

export default meta;

type Story = StoryObj<typeof ScrollHelper>;

export const Default: Story = {};
