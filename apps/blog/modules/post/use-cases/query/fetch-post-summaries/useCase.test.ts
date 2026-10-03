import { describe, expect, it, vi } from 'vitest';
import { PostStatus } from '../../../domain';
import { InvalidPaginationError } from '../../shared';
import {
  createPostSummaryOutput,
  createPostSummaryOutputs,
} from '../../shared/testing/factories';
import type { FetchPostSummariesQueryService } from './queryService';
import { FetchPostSummaries } from './useCase';

describe('FetchPostSummaries', () => {
  const createMockQueryService = (
    overrides: Partial<FetchPostSummariesQueryService> = {}
  ): FetchPostSummariesQueryService => ({
    fetchPostSummaries: vi.fn().mockResolvedValue({ posts: [], totalCount: 0 }),
    ...overrides,
  });

  describe('execute', () => {
    it('returns paginated post summaries', async () => {
      const posts = createPostSummaryOutputs(3);
      const queryService = createMockQueryService({
        fetchPostSummaries: vi.fn().mockResolvedValue({ posts, totalCount: 3 }),
      });
      const sut = new FetchPostSummaries(queryService);

      const result = await sut.execute({ page: 1, pageSize: 10 });

      expect(result.items).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.currentPage).toBe(1);
    });

    it('selects the first ten descending summaries by default', async () => {
      const firstPageSummary = createPostSummaryOutput({ id: 'first-page-id' });
      const queryService = createMockQueryService({
        fetchPostSummaries: async ({ page, pageSize, orderBy, status }) =>
          page === 1 &&
          pageSize === 10 &&
          orderBy === 'desc' &&
          status === undefined
            ? { posts: [firstPageSummary], totalCount: 1 }
            : { posts: [], totalCount: 0 },
      });
      const sut = new FetchPostSummaries(queryService);

      const result = await sut.execute();

      expect(result.items.map((post) => post.id)).toEqual(['first-page-id']);
    });

    it('selects summaries with the requested publication status', async () => {
      const publishedSummary = createPostSummaryOutput({ id: 'published-id' });
      const queryService = createMockQueryService({
        fetchPostSummaries: async ({ status }) =>
          status === PostStatus.PUBLISHED
            ? { posts: [publishedSummary], totalCount: 1 }
            : { posts: [], totalCount: 0 },
      });
      const sut = new FetchPostSummaries(queryService);

      const result = await sut.execute({ status: PostStatus.PUBLISHED });

      expect(result.items.map((post) => post.id)).toEqual(['published-id']);
    });

    it('calculates pagination correctly', async () => {
      const posts = createPostSummaryOutputs(5);
      const queryService = createMockQueryService({
        fetchPostSummaries: vi
          .fn()
          .mockResolvedValue({ posts, totalCount: 25 }),
      });
      const sut = new FetchPostSummaries(queryService);

      const result = await sut.execute({ page: 2, pageSize: 5 });

      expect(result.totalPages).toBe(5);
      expect(result.currentPage).toBe(2);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
    });

    it('sets hasNextPage to false on last page', async () => {
      const queryService = createMockQueryService({
        fetchPostSummaries: vi
          .fn()
          .mockResolvedValue({ posts: [], totalCount: 10 }),
      });
      const sut = new FetchPostSummaries(queryService);

      const result = await sut.execute({ page: 1, pageSize: 10 });

      expect(result.hasNextPage).toBe(false);
    });

    it('sets hasPreviousPage to false on first page', async () => {
      const queryService = createMockQueryService({
        fetchPostSummaries: vi
          .fn()
          .mockResolvedValue({ posts: [], totalCount: 10 }),
      });
      const sut = new FetchPostSummaries(queryService);

      const result = await sut.execute({ page: 1, pageSize: 5 });

      expect(result.hasPreviousPage).toBe(false);
    });

    it('throws InvalidPaginationError when page is less than 1', async () => {
      const queryService = createMockQueryService();
      const sut = new FetchPostSummaries(queryService);

      await expect(sut.execute({ page: 0 })).rejects.toThrow(
        InvalidPaginationError
      );
    });

    it('throws InvalidPaginationError when pageSize is less than 1', async () => {
      const queryService = createMockQueryService();
      const sut = new FetchPostSummaries(queryService);

      await expect(sut.execute({ pageSize: 0 })).rejects.toThrow(
        InvalidPaginationError
      );
    });

    it('throws InvalidPaginationError when pageSize exceeds 100', async () => {
      const queryService = createMockQueryService();
      const sut = new FetchPostSummaries(queryService);

      await expect(sut.execute({ pageSize: 101 })).rejects.toThrow(
        InvalidPaginationError
      );
    });
  });
});
