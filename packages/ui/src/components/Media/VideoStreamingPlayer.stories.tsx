import type { Meta, StoryObj } from '@storybook/react-webpack5';

import VideoStreamingPlayer from './VideoStreamingPlayer';

const meta = {
  component: VideoStreamingPlayer,
  args: {
    width: 560,
    height: 315,
  },
  argTypes: {
    url: {
      control: 'text',
      description: 'The embed URL for the streaming video',
    },
    width: {
      control: 'number',
      description: 'Width of the video player in pixels',
    },
    height: {
      control: 'number',
      description: 'Height of the video player in pixels',
    },
    name: {
      control: 'text',
      description: 'Title attribute for accessibility',
    },
    allow: {
      control: 'text',
      description: 'Permissions policy for the iframe',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'components.videoStreamingPlayer.description',
      },
      overview: 'components.videoStreamingPlayer.overview',
      usage: 'components.videoStreamingPlayer.usage',
      accessibility: 'components.videoStreamingPlayer.accessibility',
      doList: 'components.videoStreamingPlayer.doList',
      dontList: 'components.videoStreamingPlayer.dontList',
      relatedComponents: 'components.videoStreamingPlayer.relatedComponents',
      dependencies: 'components.videoStreamingPlayer.dependencies',
      references: 'components.videoStreamingPlayer.references',
    },
  },
} satisfies Meta<typeof VideoStreamingPlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const YouTube: Story = {
  args: {
    url: 'https://www.youtube.com/embed/ROZGwZ3Raqg?si=sWrNUL8hdc329EUM',
    width: 560,
    height: 315,
    name: 'YouTube video player',
    allow:
      'fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
  },
};

export const Vimeo: Story = {
  args: {
    url: 'https://player.vimeo.com/video/276931185?h=4be49570cd&badge=0',
    width: 640,
    height: 360,
    name: 'Vimeo video player',
    allow:
      'fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
  },
};

export const CustomSize: Story = {
  args: {
    url: 'https://www.youtube.com/embed/ROZGwZ3Raqg?si=sWrNUL8hdc329EUM',
    width: 800,
    height: 450,
    name: 'Large YouTube video player',
    allow: 'fullscreen',
  },
};
