import { describe, expect, it, vi } from 'vitest';

import { PostStatus } from '../../modules/post/domain';

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
  it('returns an RSS response for published posts', async () => {
    const { GET } = await import('./route');
    execute.mockResolvedValue({
      items: [
        {
          id: 'post-id',
          title: 'Published post',
          excerpt: 'Post excerpt',
          imageUrl: 'https://example.com/image.png',
          slug: 'post-id/published-post',
          category: 'ENGINEERING',
          author: null,
          releaseDate: '2024-01-10',
        },
      ],
      totalCount: 1,
      totalPages: 1,
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    const sut = await GET();

    await expect(sut.text()).resolves.toContain(
      '<link>https://example.com/blog/post-id/published-post</link>'
    );
    expect(sut.headers.get('Content-Type')).toBe(
      'application/rss+xml; charset=utf-8'
    );
    expect(execute).toHaveBeenCalledWith({
      page: 1,
      pageSize: 100,
      status: PostStatus.PUBLISHED,
    });
  });
});
