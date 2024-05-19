import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import Pagination from '.';

const meta: Meta<typeof Pagination> = {
  component: Pagination,
  tags: ['autodocs'],
};

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
