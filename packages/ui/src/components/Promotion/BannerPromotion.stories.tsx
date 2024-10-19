import type { Meta, StoryObj } from '@storybook/react';

import BannerPromotion from './BannerPromotion';

const meta: Meta<typeof BannerPromotion> = {
  component: BannerPromotion,
  parameters: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BannerPromotion
      linkText="バナーアフィリエイト"
      linkUrl="https://example.com"
      imageUrl="https://dummyimage.com/500x100/000/fff"
      imageWidth={500}
      imageHeight={100}
    />
  ),
};
