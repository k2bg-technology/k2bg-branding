import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { TextPromotion } from './TextPromotion';

const meta: Meta<typeof TextPromotion> = {
  title: 'TextPromotion',
  component: TextPromotion,
  parameters: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TextPromotion href="https://example.com">
      テキストリンクアフィリエイト
    </TextPromotion>
  ),
};
