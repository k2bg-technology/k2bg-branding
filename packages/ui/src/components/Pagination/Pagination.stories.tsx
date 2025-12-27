import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { fn } from 'storybook/test';

import Pagination from '.';

const meta = {
  component: Pagination,
  args: {
    count: 10,
    currentIndex: 1,
    prevProps: {
      onClick: fn(),
    },
    nextProps: {
      onClick: fn(),
    },
    renderItem: (index) => <Pagination.Item>{index}</Pagination.Item>,
  },
  argTypes: {
    count: {
      control: 'number',
      description: 'Total number of pages',
    },
    currentIndex: {
      control: 'number',
      description: 'Current active page index',
    },
    prevProps: {
      control: 'object',
      description: 'Props for the previous button',
    },
    nextProps: {
      control: 'object',
      description: 'Props for the next button',
    },
    renderItem: {
      control: 'object',
      description: 'Function to render each pagination item',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'components.pagination.description',
      },
      overview: 'components.pagination.overview',
      usage: 'components.pagination.usage',
      accessibility: 'components.pagination.accessibility',
      doList: 'components.pagination.doList',
      dontList: 'components.pagination.dontList',
      relatedComponents: 'components.pagination.relatedComponents',
      dependencies: 'components.pagination.dependencies',
      references: 'components.pagination.references',
    },
  },
  render: function Render(args) {
    const [currentIndex, setCurrentIndex] = useState(args.currentIndex);

    return (
      <Pagination
        count={args.count}
        currentIndex={currentIndex}
        prevProps={{
          onClick: () => {
            setCurrentIndex(currentIndex - 1);
          },
        }}
        nextProps={{
          onClick: () => {
            setCurrentIndex(currentIndex + 1);
          },
        }}
        renderItem={(index) => (
          <Pagination.Item
            selected={index === currentIndex}
            onClick={() => {
              setCurrentIndex(index);
            }}
          >
            {index}
          </Pagination.Item>
        )}
      />
    );
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FewPages: Story = {
  args: {
    count: 5,
  },
};

export const ManyPages: Story = {
  args: {
    count: 50,
  },
};

export const MiddlePage: Story = {
  args: {
    count: 30,
    currentIndex: 15,
  },
};

export const LastPage: Story = {
  args: {
    count: 10,
    currentIndex: 10,
  },
};
