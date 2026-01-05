import type { Meta, StoryObj } from '@storybook/nextjs';

import { ExternalLinkButton } from './ExternalLinkButton';

const meta: Meta<typeof ExternalLinkButton> = {
  component: ExternalLinkButton,
  globals: {
    backgrounds: { value: 'dark' },
  },
};

export default meta;

type Story = StoryObj<typeof ExternalLinkButton>;

export const Default: Story = {};
