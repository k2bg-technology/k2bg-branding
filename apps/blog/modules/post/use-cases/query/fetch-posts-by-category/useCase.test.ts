import { describe, expect, it, vi } from 'vitest';
import { Category } from '../../../domain';
import { InvalidPaginationError } from '../../shared';
import {
  createPostsWithAuthor,
  createPostWithAuthor,
} from '../../shared/testing/factories';
import type { FetchPostsByCategoryQueryService } from './queryService';
import { FetchPostsByCategory } from './useCase';

describe('FetchPostsByCategory', () => {
  const createMockQueryService = (
    overrides: Partial<FetchPostsByCategoryQueryService> = {}
  ): FetchPostsByCategoryQueryService => ({
    fetchPostsByCategory: vi
      .fn()
      .mockResolvedValue({ posts: [], totalCount: 0 }),
    ...overrides,
  });

  describe('execute', () => {
    it('returns paginated posts for given category', async () => {
      const posts = createPostsWithAuthor(3);
      const queryService = createMockQueryService({
        fetchPostsByCategory: vi
          .fn()
          .mockResolvedValue({ posts, totalCount: 3 }),
      });
      const sut = new FetchPostsByCategory(queryService);

      const result = await sut.execute({
        category: Category.ENGINEERING,
        page: 1,
        pageSize: 10,
      });

      expect(result.items).toHaveLength(3);
      expect(result.totalCount).toBe(3);
    });

    it('passes category to query service', async () => {
      const fetchPostsByCategory = vi
        .fn()
        .mockResolvedValue({ posts: [], totalCount: 0 });
      const queryService = createMockQueryService({ fetchPostsByCategory });
      const sut = new FetchPostsByCategory(queryService);

      await sut.execute({ category: Category.LIFE_STYLE });

      expect(fetchPostsByCategory).toHaveBeenCalledWith(
        expect.objectContaining({ category: Category.LIFE_STYLE })
      );
    });

    it('uses default pagination values', async () => {
      const fetchPostsByCategory = vi
        .fn()
        .mockResolvedValue({ posts: [], totalCount: 0 });
      const queryService = createMockQueryService({ fetchPostsByCategory });
      const sut = new FetchPostsByCategory(queryService);

      await sut.execute({ category: Category.ENGINEERING });

      expect(fetchPostsByCategory).toHaveBeenCalledWith({
        category: Category.ENGINEERING,
        page: 1,
        pageSize: 10,
        orderBy: 'desc',
      });
    });

    it('calculates pagination correctly', async () => {
      const queryService = createMockQueryService({
        fetchPostsByCategory: vi
          .fn()
          .mockResolvedValue({ posts: [], totalCount: 25 }),
      });
      const sut = new FetchPostsByCategory(queryService);

      const result = await sut.execute({
        category: Category.ENGINEERING,
        page: 2,
        pageSize: 5,
      });

      expect(result.totalPages).toBe(5);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
    });

    it('throws InvalidPaginationError when page is less than 1', async () => {
      const queryService = createMockQueryService();
      const sut = new FetchPostsByCategory(queryService);

      await expect(
        sut.execute({ category: Category.ENGINEERING, page: 0 })
      ).rejects.toThrow(InvalidPaginationError);
    });

    it('throws InvalidPaginationError when pageSize exceeds 100', async () => {
      const queryService = createMockQueryService();
      const sut = new FetchPostsByCategory(queryService);

      await expect(
        sut.execute({ category: Category.ENGINEERING, pageSize: 101 })
      ).rejects.toThrow(InvalidPaginationError);
    });

    it('maps Post entities to PostOutput', async () => {
      const postWithAuthor = createPostWithAuthor();
      const { post } = postWithAuthor;
      const queryService = createMockQueryService({
        fetchPostsByCategory: vi
          .fn()
          .mockResolvedValue({ posts: [postWithAuthor], totalCount: 1 }),
      });
      const sut = new FetchPostsByCategory(queryService);

      const result = await sut.execute({ category: Category.ENGINEERING });

      expect(result.items[0].id).toBe(post.id.getValue());
      expect(result.items[0].category).toBe(post.category);
    });
  });
});
