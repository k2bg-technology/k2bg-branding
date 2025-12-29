import type { Meta, StoryObj } from '@storybook/react-webpack5';

import VideoFilePlayer from './VideoFilePlayer';

const meta = {
  component: VideoFilePlayer,
  args: {
    file: 'https://www.w3schools.com/html/mov_bbb.mp4',
    width: 600,
    height: 400,
    controls: true,
  },
  argTypes: {
    file: {
      control: 'text',
      description: 'URL or path to the video file',
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
      description: 'Optional name for the video caption track',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'undefined' },
      },
    },
    controls: {
      control: 'boolean',
      description: 'Show video player controls',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    autoPlay: {
      control: 'boolean',
      description: 'Auto-play the video on load',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    loop: {
      control: 'boolean',
      description: 'Loop the video playback',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    muted: {
      control: 'boolean',
      description: 'Mute the video audio',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'components.videoFilePlayer.description',
      },
      overview: 'components.videoFilePlayer.overview',
      usage: 'components.videoFilePlayer.usage',
      accessibility: 'components.videoFilePlayer.accessibility',
      doList: 'components.videoFilePlayer.doList',
      dontList: 'components.videoFilePlayer.dontList',
      relatedComponents: 'components.videoFilePlayer.relatedComponents',
      dependencies: 'components.videoFilePlayer.dependencies',
      references: 'components.videoFilePlayer.references',
    },
  },
} satisfies Meta<typeof VideoFilePlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAutoPlay: Story = {
  args: {
    autoPlay: true,
    muted: true,
  },
};

export const WithLoop: Story = {
  args: {
    loop: true,
    muted: true,
  },
};

export const WithoutControls: Story = {
  args: {
    controls: false,
  },
};
