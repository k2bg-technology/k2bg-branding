import type { Meta, StoryObj } from '@storybook/react-vite';

import { EmbeddedVideoPlayer } from './EmbeddedVideoPlayer';

const meta: Meta<typeof EmbeddedVideoPlayer> = {
  component: EmbeddedVideoPlayer,
  parameters: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const YouTube: Story = {
  render: () => (
    <EmbeddedVideoPlayer
      url="https://www.youtube.com/embed/ROZGwZ3Raqg?si=sWrNUL8hdc329EUM"
      width={560}
      height={315}
      allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    />
  ),
};

export const Vimeo: Story = {
  render: () => (
    <EmbeddedVideoPlayer
      url="https://player.vimeo.com/video/276931185?h=4be49570cd&badge=0"
      width={640}
      height={360}
      allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    />
  ),
};
