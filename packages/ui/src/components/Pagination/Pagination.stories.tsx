import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { Pagination } from '.';

const meta = {
  component: Pagination,
  args: {
    count: 10,
    currentPage: 1,
    prevProps: {
      onClick: fn(),
    },
    nextProps: {
      onClick: fn(),
    },
    renderItem: (page) => <Pagination.Item>{page}</Pagination.Item>,
  },
  argTypes: {
    count: {
      control: 'number',
      description: 'Total number of pages',
    },
    currentPage: {
      control: 'number',
      description: 'Current active page index',
    },
    prevProps: {
      control: false,
      description: 'Props for the previous button',
    },
    nextProps: {
      control: false,
      description: 'Props for the next button',
    },
    renderItem: {
      control: false,
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
    const [currentPage, setCurrentPage] = useState(args.currentPage);

    return (
      <Pagination
        count={args.count}
        currentPage={currentPage}
        prevProps={{
          onClick: () => {
            setCurrentPage(currentPage - 1);
          },
        }}
        nextProps={{
          onClick: () => {
            setCurrentPage(currentPage + 1);
          },
        }}
        renderItem={(page) => (
          <Pagination.Item
            selected={page === currentPage}
            onClick={() => {
              setCurrentPage(page);
            }}
          >
            {page}
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
    currentPage: 15,
  },
};

export const LastPage: Story = {
  args: {
    count: 10,
    currentPage: 10,
  },
};
