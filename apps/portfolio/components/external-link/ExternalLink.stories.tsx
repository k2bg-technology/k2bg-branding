import type { Meta, StoryObj } from '@storybook/nextjs';

import { ExternalLink } from './ExternalLink';

const meta: Meta<typeof ExternalLink> = {
  component: ExternalLink,
  globals: {
    backgrounds: { value: 'dark' },
  },
};

export default meta;

type Story = StoryObj<typeof ExternalLink>;

export const Default: Story = {};
