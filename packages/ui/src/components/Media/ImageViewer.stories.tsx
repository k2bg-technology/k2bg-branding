import type { Meta, StoryObj } from '@storybook/react-webpack5';

import FocusLight from '../../assets/focus-light.jpg';

import ImageViewer from './ImageViewer';

const meta = {
  component: ImageViewer,
  argTypes: {
    name: {
      control: 'text',
    },
    linkUrl: {
      control: 'text',
    },
    url: {
      control: 'text',
    },
    file: {
      control: 'text',
    },
    width: {
      control: 'number',
    },
    height: {
      control: 'number',
    },
    unoptoinized: {
      control: 'boolean',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'components.imageViewer.description',
      },
      overview: 'components.imageViewer.overview',
      usage: 'components.imageViewer.usage',
      accessibility: 'components.imageViewer.accessibility',
      doList: 'components.imageViewer.doList',
      dontList: 'components.imageViewer.dontList',
      relatedComponents: 'components.imageViewer.relatedComponents',
      dependencies: 'components.imageViewer.dependencies',
      references: 'components.imageViewer.references',
    },
  },
} satisfies Meta<typeof ImageViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Sample image',
    file: FocusLight,
    width: 500,
    height: 300,
  },
};

export const WithExternalUrl: Story = {
  args: {
    name: 'External image',
    url: 'https://dummyimage.com/500x300/000/fff',
    width: 500,
    height: 300,
  },
};

export const WithLink: Story = {
  args: {
    name: 'Linked image',
    linkUrl: 'https://example.com',
    url: 'https://dummyimage.com/500x300/000/fff',
    width: 500,
    height: 300,
  },
};

export const CustomDimensions: Story = {
  args: {
    name: 'Custom sized image',
    file: FocusLight,
    width: 300,
    height: 200,
  },
};
