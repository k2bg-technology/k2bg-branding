import type { Meta, StoryObj } from '@storybook/react';

import MusicStreamingPlayer from './MusicStreamingPlayer';

const meta: Meta<typeof MusicStreamingPlayer> = {
  component: MusicStreamingPlayer,
  parameters: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Spotify: Story = {
  render: () => (
    <MusicStreamingPlayer
      url="https://open.spotify.com/embed/track/1xjdDc5vuFbdYnCMCKNIZG?utm_source=generator"
      width="100%"
      height={352}
      allow="fullscreen; autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="rounded-md"
    />
  ),
};
