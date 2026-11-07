import type { Meta, StoryObj } from '@storybook/react-vite';

import { VideoPlayer } from './VideoPlayer';

const meta: Meta<typeof VideoPlayer> = {
  component: VideoPlayer,
  parameters: {},
};

export default meta;
type Story = StoryObj<typeof VideoPlayer>;

export const Default: Story = {
  render: () => (
    <VideoPlayer
      file="https://www.w3schools.com/html/mov_bbb.mp4"
      width={600}
      height={400}
      controls
      autoPlay
    />
  ),
};
