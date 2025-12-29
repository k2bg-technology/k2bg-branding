import type { Meta, StoryObj } from '@storybook/react-webpack5';

import VideoFilePlayer from './VideoFilePlayer';

const meta = {
  component: VideoFilePlayer,
  args: {
    width: 600,
    height: 400,
    controls: true,
  },
  argTypes: {
    file: {
      control: 'text',
      description: 'The source URL for the video file',
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
      description: 'Label for the caption track',
    },
    controls: {
      control: 'boolean',
      description: 'Display video playback controls',
    },
    autoPlay: {
      control: 'boolean',
      description: 'Automatically start playing the video',
    },
    loop: {
      control: 'boolean',
      description: 'Loop the video playback',
    },
    muted: {
      control: 'boolean',
      description: 'Mute the video audio',
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

export const Default: Story = {
  args: {
    file: 'https://www.w3schools.com/html/mov_bbb.mp4',
    width: 600,
    height: 400,
    name: 'Sample video',
    controls: true,
  },
};

export const AutoPlay: Story = {
  args: {
    file: 'https://www.w3schools.com/html/mov_bbb.mp4',
    width: 600,
    height: 400,
    name: 'Auto-playing video',
    controls: true,
    autoPlay: true,
    muted: true,
  },
};

export const Looped: Story = {
  args: {
    file: 'https://www.w3schools.com/html/mov_bbb.mp4',
    width: 600,
    height: 400,
    name: 'Looped video',
    controls: true,
    loop: true,
  },
};

export const CustomSize: Story = {
  args: {
    file: 'https://www.w3schools.com/html/mov_bbb.mp4',
    width: 800,
    height: 450,
    name: 'Large video player',
    controls: true,
  },
};
