import type { Meta, StoryObj } from '@storybook/react-vite';

import FocusLight from '../../assets/focus-light.jpg';

import { LinkableImage } from './LinkableImage';

const meta: Meta<typeof LinkableImage> = {
  component: LinkableImage,
  parameters: {},
};

export default meta;
type Story = StoryObj<typeof LinkableImage>;

export const Default: Story = {
  render: () => (
    <LinkableImage name="テスト" file={FocusLight} width={500} height={300} />
  ),
};

export const WithLink: Story = {
  render: () => (
    <LinkableImage
      name="テスト"
      linkUrl="https://example.com"
      url="https://dummyimage.com/500x300/000/fff"
      width={500}
      height={300}
    />
  ),
};
