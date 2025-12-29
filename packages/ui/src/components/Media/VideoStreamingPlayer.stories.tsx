import type { Meta, StoryObj } from '@storybook/react-webpack5';

import VideoStreamingPlayer from './VideoStreamingPlayer';

const meta = {
  component: VideoStreamingPlayer,
  args: {
    width: 560,
    height: 315,
    allow:
      'fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
  },
  argTypes: {
    url: {
      control: 'text',
      description: 'Embed URL of the streaming video platform',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '-' },
      },
    },
    width: {
      control: 'number',
      description: 'Width of the video player in pixels',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '-' },
      },
    },
    height: {
      control: 'number',
      description: 'Height of the video player in pixels',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '-' },
      },
    },
    name: {
      control: 'text',
      description: 'Optional name for the iframe title attribute',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'undefined' },
      },
    },
    allow: {
      control: 'text',
      description: 'Feature policy permissions for the iframe',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'undefined' },
      },
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
    name: 'YouTube Video',
  },
};

export const Vimeo: Story = {
  args: {
    url: 'https://player.vimeo.com/video/276931185?h=4be49570cd&badge=0',
    width: 640,
    height: 360,
    name: 'Vimeo Video',
  },
};
