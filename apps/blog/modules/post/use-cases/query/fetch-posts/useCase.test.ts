import { describe, expect, it, vi } from 'vitest';
import { InvalidPaginationError } from '../../shared';
import {
  createPostWithAuthor,
  createPostsWithAuthor,
} from '../../shared/testing/factories';
import type { FetchPostsQueryService } from './queryService';
import { FetchPosts } from './useCase';

describe('FetchPosts', () => {
  const createMockQueryService = (
    overrides: Partial<FetchPostsQueryService> = {}
  ): FetchPostsQueryService => ({
    fetchPosts: vi.fn().mockResolvedValue({ posts: [], totalCount: 0 }),
    ...overrides,
  });

  describe('execute', () => {
    it('returns paginated posts', async () => {
      const posts = createPostsWithAuthor(3);
      const queryService = createMockQueryService({
        fetchPosts: vi.fn().mockResolvedValue({ posts, totalCount: 3 }),
      });
      const sut = new FetchPosts(queryService);

      const result = await sut.execute({ page: 1, pageSize: 10 });

      expect(result.items).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.currentPage).toBe(1);
    });

    it('uses default values when not provided', async () => {
      const fetchPosts = vi
        .fn()
        .mockResolvedValue({ posts: [], totalCount: 0 });
      const queryService = createMockQueryService({ fetchPosts });
      const sut = new FetchPosts(queryService);

      await sut.execute();

      expect(fetchPosts).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        orderBy: 'desc',
      });
    });

    it('calculates pagination correctly', async () => {
      const posts = createPostsWithAuthor(5);
      const queryService = createMockQueryService({
        fetchPosts: vi.fn().mockResolvedValue({ posts, totalCount: 25 }),
      });
      const sut = new FetchPosts(queryService);

      const result = await sut.execute({ page: 2, pageSize: 5 });

      expect(result.totalPages).toBe(5);
      expect(result.currentPage).toBe(2);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
    });

    it('sets hasNextPage to false on last page', async () => {
      const queryService = createMockQueryService({
        fetchPosts: vi.fn().mockResolvedValue({ posts: [], totalCount: 10 }),
      });
      const sut = new FetchPosts(queryService);

      const result = await sut.execute({ page: 1, pageSize: 10 });

      expect(result.hasNextPage).toBe(false);
    });

    it('sets hasPreviousPage to false on first page', async () => {
      const queryService = createMockQueryService({
        fetchPosts: vi.fn().mockResolvedValue({ posts: [], totalCount: 10 }),
      });
      const sut = new FetchPosts(queryService);

      const result = await sut.execute({ page: 1, pageSize: 5 });

      expect(result.hasPreviousPage).toBe(false);
    });

    it('throws InvalidPaginationError when page is less than 1', async () => {
      const queryService = createMockQueryService();
      const sut = new FetchPosts(queryService);

      await expect(sut.execute({ page: 0 })).rejects.toThrow(
        InvalidPaginationError
      );
    });

    it('throws InvalidPaginationError when pageSize is less than 1', async () => {
      const queryService = createMockQueryService();
      const sut = new FetchPosts(queryService);

      await expect(sut.execute({ pageSize: 0 })).rejects.toThrow(
        InvalidPaginationError
      );
    });

    it('throws InvalidPaginationError when pageSize exceeds 100', async () => {
      const queryService = createMockQueryService();
      const sut = new FetchPosts(queryService);

      await expect(sut.execute({ pageSize: 101 })).rejects.toThrow(
        InvalidPaginationError
      );
    });

    it('maps Post entities to PostOutput', async () => {
      const postWithAuthor = createPostWithAuthor();
      const { post } = postWithAuthor;
      const queryService = createMockQueryService({
        fetchPosts: vi
          .fn()
          .mockResolvedValue({ posts: [postWithAuthor], totalCount: 1 }),
      });
      const sut = new FetchPosts(queryService);

      const result = await sut.execute();

      expect(result.items[0].id).toBe(post.id.getValue());
      expect(result.items[0].title).toBe(post.title.getValue());
      expect(result.items[0].slug).toBe(
        `${post.id.getValue()}/${post.slug.getValue()}`
      );
    });
  });
});
