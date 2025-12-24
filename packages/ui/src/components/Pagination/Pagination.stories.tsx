import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';

import Pagination from '.';

const meta = {
  component: Pagination,
  argTypes: {
    count: {
      control: 'number',
      description: 'Total number of pages',
    },
    currentIndex: {
      control: 'number',
      description: 'Current active page index',
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
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Default() {
    const [currentIndex, setCurrentIndex] = useState(1);

    return (
      <Pagination
        count={10}
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
};

export const FewPages: Story = {
  render: function FewPages() {
    const [currentIndex, setCurrentIndex] = useState(1);

    return (
      <Pagination
        count={5}
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
};

export const ManyPages: Story = {
  render: function ManyPages() {
    const [currentIndex, setCurrentIndex] = useState(1);

    return (
      <Pagination
        count={50}
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
};

export const MiddlePage: Story = {
  render: function MiddlePage() {
    const [currentIndex, setCurrentIndex] = useState(15);

    return (
      <Pagination
        count={30}
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
};

export const LastPage: Story = {
  render: function LastPage() {
    const [currentIndex, setCurrentIndex] = useState(10);

    return (
      <Pagination
        count={10}
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
};
