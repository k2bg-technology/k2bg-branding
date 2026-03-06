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

    it('passes category to query service', async () => {
      const fetchPostSummariesByCategory = vi
        .fn()
        .mockResolvedValue({ posts: [], totalCount: 0 });
      const queryService = createMockQueryService({
        fetchPostSummariesByCategory,
      });
      const sut = new FetchPostSummariesByCategory(queryService);

      await sut.execute({ category: Category.LIFE_STYLE });

      expect(fetchPostSummariesByCategory).toHaveBeenCalledWith(
        expect.objectContaining({ category: Category.LIFE_STYLE })
      );
    });

    it('uses default pagination values', async () => {
      const fetchPostSummariesByCategory = vi
        .fn()
        .mockResolvedValue({ posts: [], totalCount: 0 });
      const queryService = createMockQueryService({
        fetchPostSummariesByCategory,
      });
      const sut = new FetchPostSummariesByCategory(queryService);

      await sut.execute({ category: Category.ENGINEERING });

      expect(fetchPostSummariesByCategory).toHaveBeenCalledWith({
        category: Category.ENGINEERING,
        page: 1,
        pageSize: 10,
        orderBy: 'desc',
      });
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

    it('passes through PostSummaryOutput from query service', async () => {
      const summary = createPostSummaryOutput({
        id: 'test-uuid',
        category: Category.ENGINEERING,
      });
      const queryService = createMockQueryService({
        fetchPostSummariesByCategory: vi
          .fn()
          .mockResolvedValue({ posts: [summary], totalCount: 1 }),
      });
      const sut = new FetchPostSummariesByCategory(queryService);

      const result = await sut.execute({ category: Category.ENGINEERING });

      expect(result.items[0].id).toBe('test-uuid');
      expect(result.items[0].category).toBe(Category.ENGINEERING);
    });
  });
});
