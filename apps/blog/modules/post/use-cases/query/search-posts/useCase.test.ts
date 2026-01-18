import { describe, expect, it, vi } from 'vitest';
import { InvalidPaginationError, InvalidSearchQueryError } from '../../shared';
import { createPost, createPosts } from '../../shared/testing/factories';
import type { SearchPostsQueryService } from './queryService';
import { SearchPosts } from './useCase';

describe('SearchPosts', () => {
  const createMockQueryService = (
    overrides: Partial<SearchPostsQueryService> = {}
  ): SearchPostsQueryService => ({
    searchPosts: vi.fn().mockResolvedValue({ posts: [], totalCount: 0 }),
    ...overrides,
  });

  describe('execute', () => {
    it('returns search results with pagination', async () => {
      const posts = createPosts(3);
      const queryService = createMockQueryService({
        searchPosts: vi.fn().mockResolvedValue({ posts, totalCount: 3 }),
      });
      const sut = new SearchPosts(queryService);

      const result = await sut.execute({ query: 'typescript' });

      expect(result.items).toHaveLength(3);
      expect(result.totalCount).toBe(3);
    });

    it('trims and passes query to service', async () => {
      const searchPosts = vi
        .fn()
        .mockResolvedValue({ posts: [], totalCount: 0 });
      const queryService = createMockQueryService({ searchPosts });
      const sut = new SearchPosts(queryService);

      await sut.execute({ query: '  typescript  ' });

      expect(searchPosts).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'typescript' })
      );
    });

    it('uses default pagination values', async () => {
      const searchPosts = vi
        .fn()
        .mockResolvedValue({ posts: [], totalCount: 0 });
      const queryService = createMockQueryService({ searchPosts });
      const sut = new SearchPosts(queryService);

      await sut.execute({ query: 'test' });

      expect(searchPosts).toHaveBeenCalledWith({
        query: 'test',
        page: 1,
        pageSize: 10,
        orderBy: 'desc',
      });
    });

    it('throws InvalidSearchQueryError when query is too short', async () => {
      const queryService = createMockQueryService();
      const sut = new SearchPosts(queryService);

      await expect(sut.execute({ query: 'a' })).rejects.toThrow(
        InvalidSearchQueryError
      );
    });

    it('throws InvalidSearchQueryError when query is too long', async () => {
      const queryService = createMockQueryService();
      const sut = new SearchPosts(queryService);
      const longQuery = 'a'.repeat(101);

      await expect(sut.execute({ query: longQuery })).rejects.toThrow(
        InvalidSearchQueryError
      );
    });

    it('throws InvalidSearchQueryError when query is only whitespace', async () => {
      const queryService = createMockQueryService();
      const sut = new SearchPosts(queryService);

      await expect(sut.execute({ query: '   ' })).rejects.toThrow(
        InvalidSearchQueryError
      );
    });

    it('throws InvalidPaginationError when page is less than 1', async () => {
      const queryService = createMockQueryService();
      const sut = new SearchPosts(queryService);

      await expect(
        sut.execute({ query: 'test', page: 0 })
      ).rejects.toThrow(InvalidPaginationError);
    });

    it('calculates pagination correctly', async () => {
      const queryService = createMockQueryService({
        searchPosts: vi.fn().mockResolvedValue({ posts: [], totalCount: 25 }),
      });
      const sut = new SearchPosts(queryService);

      const result = await sut.execute({
        query: 'test',
        page: 3,
        pageSize: 5,
      });

      expect(result.totalPages).toBe(5);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
    });

    it('maps Post entities to PostOutput', async () => {
      const post = createPost();
      const queryService = createMockQueryService({
        searchPosts: vi
          .fn()
          .mockResolvedValue({ posts: [post], totalCount: 1 }),
      });
      const sut = new SearchPosts(queryService);

      const result = await sut.execute({ query: 'test' });

      expect(result.items[0].id).toBe(post.id.getValue());
    });
  });
});
