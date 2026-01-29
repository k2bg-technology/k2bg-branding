import type { Meta, StoryObj } from '@storybook/react-webpack5';

import BannerPromotion from './BannerPromotion';

const meta: Meta<typeof BannerPromotion> = {
  title: 'BannerPromotion',
  component: BannerPromotion,
  parameters: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BannerPromotion
      linkUrl="https://example.com"
      image={
        <img
          src="https://dummyimage.com/500x100/000/fff"
          alt="Banner Promotion"
          width={500}
          height={100}
        />
      }
    />
  ),
};
