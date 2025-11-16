import type { Meta, StoryObj } from '@storybook/react-webpack5';

import FocusLight from '../../assets/focus-light.jpg';

import ImageViewer from './ImageViewer';

const meta: Meta<typeof ImageViewer> = {
  component: ImageViewer,
  parameters: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ImageViewer name="テスト" file={FocusLight} width={500} height={300} />
  ),
};

export const WithLink: Story = {
  render: () => (
    <ImageViewer
      name="テスト"
      linkUrl="https://example.com"
      url="https://dummyimage.com/500x300/000/fff"
      width={500}
      height={300}
    />
  ),
};
