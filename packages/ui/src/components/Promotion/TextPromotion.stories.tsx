import type { Meta, StoryObj } from '@storybook/react';

import TextPromotion from './TextPromotion';

const meta: Meta<typeof TextPromotion> = {
  component: TextPromotion,
  parameters: {},
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TextPromotion
      linkText="テキストリンクアフィリエイト"
      linkUrl="https://example.com"
    />
  ),
};
