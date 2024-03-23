import type { Meta, StoryObj } from '@storybook/react';

import ExternalLinkButton from './ExternalLinkButton';

const meta = {
  component: ExternalLinkButton,
  parameters: {},
  tags: ['autodocs'],
} satisfies Meta<typeof ExternalLinkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'ExternalLinkButton',
    href: 'https://example.com',
    target: '_blank',
  },
};
