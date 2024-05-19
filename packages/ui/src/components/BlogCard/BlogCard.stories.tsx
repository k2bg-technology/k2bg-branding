import type { Meta, StoryObj } from '@storybook/react';

import { Avatar } from '../Avatar';

import BlogCard from '.';

const meta: Meta<
  typeof BlogCard & typeof BlogCard.Media & typeof BlogCard.Content
> = {
  component: BlogCard,
  parameters: {},
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '63.5rem' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    category: (
      <a href="https://example.com" target="_blank" rel="noreferrer">
        プログラミング
      </a>
    ),
    heading: (
      <a href="https://example.com" target="_blank" rel="noreferrer">
        <h3 className="text-header-3 font-bold">記事のタイトル</h3>
      </a>
    ),
    excerpt:
      '記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋',
    avatar: (
      <Avatar
        image={
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt="Office"
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=2080&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          />
        }
        name="Kuroda Kentaro"
      />
    ),
    date: 'September 30, 2023',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <BlogCard className="flex-col gap-6" {...args}>
      <BlogCard.Media>
        <a href="https://example.com" target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Office"
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
          />
        </a>
      </BlogCard.Media>
      <BlogCard.Content {...args} />
    </BlogCard>
  ),
};

export const Horizontal: Story = {
  render: (args) => (
    <BlogCard className="flex-row gap-8" {...args}>
      <BlogCard.Media className="flex-none max-w-[16rem]">
        <a href="https://example.com" target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Office"
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
          />
        </a>
      </BlogCard.Media>
      <BlogCard.Content {...args} />
    </BlogCard>
  ),
};

export const Hero: Story = {
  render: (args) => (
    <BlogCard className="flex-col gap-6" {...args}>
      <BlogCard.Content
        {...args}
        heading={
          <a href="https://example.com" target="_blank" rel="noreferrer">
            <h1 className="text-header-1 font-bold">記事のタイトル</h1>
          </a>
        }
      />
      <BlogCard.Media>
        <a href="https://example.com" target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Office"
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
          />
        </a>
      </BlogCard.Media>
    </BlogCard>
  ),
};

export const Skelton: Story = {
  render: (args) => (
    <BlogCard className="flex-col gap-6" {...args}>
      <BlogCard.Skelton />
    </BlogCard>
  ),
};
