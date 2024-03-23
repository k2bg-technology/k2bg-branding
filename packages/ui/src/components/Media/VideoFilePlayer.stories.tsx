import type { Meta, StoryObj } from '@storybook/react';

import VideoFilePlayer from './VideoFilePlayer';

const meta: Meta<typeof VideoFilePlayer> = {
  component: VideoFilePlayer,
  parameters: {},
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <VideoFilePlayer
      file="https://www.w3schools.com/html/mov_bbb.mp4"
      width={600}
      height={400}
      controls
      autoPlay
    />
  ),
};
