import type { Meta, StoryObj } from '@storybook/react';

import ProductPromotion from './ProductPromotion';

const meta: Meta<typeof ProductPromotion> = {
  component: ProductPromotion,
  parameters: {},
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ProductPromotion
      linkText="商品紹介アフィリエイト"
      linkUrl="https://www.amazon.co.jp"
      imageUrl="https://dummyimage.com/120x150/000/fff"
      imageWidth={120}
      imageHeight={150}
      providers={[
        {
          linkText: '楽天',
          linkUrl: 'https://www.rakuten.co.jp',
        },
        {
          linkText: 'amazon',
          linkUrl: 'https://www.amazon.co.jp',
        },
        {
          linkText: 'yahoo',
          linkUrl: 'https://www.yahoo.co.jp',
        },
      ]}
    />
  ),
};
