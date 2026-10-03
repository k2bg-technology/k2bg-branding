import { describe, expect, it, vi } from 'vitest';
import { Category } from '../../../domain';
import { InvalidPaginationError } from '../../shared';
import {
  createPostSummaryOutput,
  createPostSummaryOutputs,
} from '../../shared/testing/factories';
import type { FetchPostSummariesByCategoryQueryService } from './queryService';
import { FetchPostSummariesByCategory } from './useCase';

describe('FetchPostSummariesByCategory', () => {
  const createMockQueryService = (
    overrides: Partial<FetchPostSummariesByCategoryQueryService> = {}
  ): FetchPostSummariesByCategoryQueryService => ({
    fetchPostSummariesByCategory: vi
      .fn()
      .mockResolvedValue({ posts: [], totalCount: 0 }),
    ...overrides,
  });

  describe('execute', () => {
    it('returns paginated post summaries for given category', async () => {
      const posts = createPostSummaryOutputs(3);
      const queryService = createMockQueryService({
        fetchPostSummariesByCategory: vi
          .fn()
          .mockResolvedValue({ posts, totalCount: 3 }),
      });
      const sut = new FetchPostSummariesByCategory(queryService);

      const result = await sut.execute({
        category: Category.ENGINEERING,
        page: 1,
        pageSize: 10,
      });

      expect(result.items).toHaveLength(3);
      expect(result.totalCount).toBe(3);
    });

    it('selects summaries for the requested category', async () => {
      const lifeStyleSummary = createPostSummaryOutput({
        id: 'life-style-id',
        category: Category.LIFE_STYLE,
      });
      const queryService = createMockQueryService({
        fetchPostSummariesByCategory: async ({ category }) =>
          category === Category.LIFE_STYLE
            ? { posts: [lifeStyleSummary], totalCount: 1 }
            : { posts: [], totalCount: 0 },
      });
      const sut = new FetchPostSummariesByCategory(queryService);

      const result = await sut.execute({ category: Category.LIFE_STYLE });

      expect(result.items.map((post) => post.id)).toEqual(['life-style-id']);
    });

    it('selects the first ten descending summaries by default', async () => {
      const firstPageSummary = createPostSummaryOutput({ id: 'first-page-id' });
      const queryService = createMockQueryService({
        fetchPostSummariesByCategory: async ({ page, pageSize, orderBy }) =>
          page === 1 && pageSize === 10 && orderBy === 'desc'
            ? { posts: [firstPageSummary], totalCount: 1 }
            : { posts: [], totalCount: 0 },
      });
      const sut = new FetchPostSummariesByCategory(queryService);

      const result = await sut.execute({ category: Category.ENGINEERING });

      expect(result.items.map((post) => post.id)).toEqual(['first-page-id']);
    });

    it('calculates pagination correctly', async () => {
      const queryService = createMockQueryService({
        fetchPostSummariesByCategory: vi
          .fn()
          .mockResolvedValue({ posts: [], totalCount: 25 }),
      });
      const sut = new FetchPostSummariesByCategory(queryService);

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
      const sut = new FetchPostSummariesByCategory(queryService);

      await expect(
        sut.execute({ category: Category.ENGINEERING, page: 0 })
      ).rejects.toThrow(InvalidPaginationError);
    });

    it('throws InvalidPaginationError when pageSize exceeds 100', async () => {
      const queryService = createMockQueryService();
      const sut = new FetchPostSummariesByCategory(queryService);

      await expect(
        sut.execute({ category: Category.ENGINEERING, pageSize: 101 })
      ).rejects.toThrow(InvalidPaginationError);
    });
  });
});
