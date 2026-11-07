import type { Meta, StoryObj } from '@storybook/react-vite';

import { EmbeddedMusicPlayer } from './EmbeddedMusicPlayer';

const meta: Meta<typeof EmbeddedMusicPlayer> = {
  component: EmbeddedMusicPlayer,
  parameters: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Spotify: Story = {
  render: () => (
    <EmbeddedMusicPlayer
      url="https://open.spotify.com/embed/track/1xjdDc5vuFbdYnCMCKNIZG?utm_source=generator"
      width="100%"
      height={352}
      allow="fullscreen; autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="rounded-md"
    />
  ),
};
