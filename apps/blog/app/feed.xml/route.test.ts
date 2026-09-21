import { describe, expect, it, vi } from 'vitest';

import { PostStatus } from '../../modules/post/domain';
import type { FetchPostSummariesInput } from '../../modules/post/use-cases';

const { execute } = vi.hoisted(() => ({
  execute: vi.fn(),
}));

vi.mock('../../infrastructure/di', () => ({
  createFetchPostSummariesUseCase: () => ({ execute }),
}));

vi.mock('../siteMetadata', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../siteMetadata')>();
  return {
    ...actual,
    getBlogSiteBaseUrl: () => 'https://example.com',
  };
});

describe('GET', () => {
  it('returns an RSS response containing published posts from every page', async () => {
    const { GET } = await import('./route');
    const posts = [
      {
        id: 'first-post',
        title: 'First published post',
        excerpt: 'First post excerpt',
        imageUrl: 'https://example.com/first.png',
        slug: 'first-post/published-post',
        category: 'ENGINEERING',
        author: null,
        status: PostStatus.PUBLISHED,
        releaseDate: '2024-01-10',
      },
      {
        id: 'second-post',
        title: 'Second published post',
        excerpt: 'Second post excerpt',
        imageUrl: 'https://example.com/second.png',
        slug: 'second-post/published-post',
        category: 'ENGINEERING',
        author: null,
        status: PostStatus.PUBLISHED,
        releaseDate: '2024-01-09',
      },
    ];
    execute.mockImplementation(
      async ({ page = 1, status }: FetchPostSummariesInput) => ({
        items: posts
          .filter((post) => post.status === status)
          .slice(page - 1, page),
        totalCount: posts.length,
        totalPages: posts.length,
        currentPage: page,
        hasNextPage: page < posts.length,
        hasPreviousPage: page > 1,
      })
    );

    const sut = await GET();

    const feed = new DOMParser().parseFromString(await sut.text(), 'text/xml');
    expect(
      Array.from(
        feed.querySelectorAll('item > link'),
        (link) => link.textContent
      )
    ).toEqual([
      'https://example.com/blog/first-post/published-post',
      'https://example.com/blog/second-post/published-post',
    ]);
    expect(sut.headers.get('Content-Type')).toBe(
      'application/rss+xml; charset=utf-8'
    );
  });
});
