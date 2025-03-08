import type { Meta, StoryObj } from '@storybook/react';

import Avatar from '../Avatar';
import AvatarImage from '../../assets/avatar.png';
import BlogCardMainImage from '../../assets/blog-card-main.png';

import BlogCard from '.';

const meta: Meta<
  typeof BlogCard & typeof BlogCard.Media & typeof BlogCard.Content
> = {
  component: BlogCard,
  parameters: {},
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '40rem' }}>
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
        <h3 className="text-heading-3 font-bold">記事のタイトル</h3>
      </a>
    ),
    excerpt:
      '記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋記事の抜粋',
    avatar: (
      <Avatar className="h-8 w-8">
        <Avatar.Image alt="Office" src={AvatarImage} />
      </Avatar>
    ),
    date: 'September 30, 2023',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <BlogCard className="flex-col gap-spacious" {...args}>
      <BlogCard.Media>
        <a href="https://example.com" target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Office" src={BlogCardMainImage} />
        </a>
      </BlogCard.Media>
      <BlogCard.Content {...args} />
    </BlogCard>
  ),
};

export const Horizontal: Story = {
  render: (args) => (
    <BlogCard className="flex-row gap-5" {...args}>
      <BlogCard.Media className="flex-none max-w-[16rem]">
        <a href="https://example.com" target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Office" src={BlogCardMainImage} />
        </a>
      </BlogCard.Media>
      <BlogCard.Content {...args} />
    </BlogCard>
  ),
};

export const Hero: Story = {
  render: (args) => (
    <BlogCard className="flex-col gap-spacious" {...args}>
      <BlogCard.Content
        {...args}
        heading={
          <a href="https://example.com" target="_blank" rel="noreferrer">
            <h1 className="text-heading-1 font-bold">記事のタイトル</h1>
          </a>
        }
      />
      <BlogCard.Media>
        <a href="https://example.com" target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Office" src={BlogCardMainImage} />
        </a>
      </BlogCard.Media>
    </BlogCard>
  ),
};

export const Skelton: Story = {
  render: (args) => (
    <BlogCard className="flex-col gap-spacious" {...args}>
      <BlogCard.Skelton />
    </BlogCard>
  ),
};
