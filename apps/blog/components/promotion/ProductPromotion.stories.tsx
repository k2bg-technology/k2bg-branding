import type { Meta, StoryObj } from '@storybook/react-webpack5';

import ProductPromotion from './ProductPromotion';

const meta: Meta<typeof ProductPromotion> = {
  title: 'ProductPromotion',
  component: ProductPromotion,
  parameters: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ProductPromotion
      linkText="商品紹介アフィリエイト"
      linkUrl="https://www.amazon.co.jp"
      imageUrl="https://dummyimage.com/120x160/000/fff"
      imageWidth={120}
      imageHeight={160}
      providers={[
        {
          linkText: '楽天',
          linkUrl: 'https://www.rakuten.co.jp',
          color: '#bf0000',
        },
        {
          linkText: 'amazon',
          linkUrl: 'https://www.amazon.co.jp',
          color: '#ff9900',
        },
        {
          linkText: 'yahoo',
          linkUrl: 'https://www.yahoo.co.jp',
          color: '#ff0033',
        },
      ]}
    />
  ),
};
