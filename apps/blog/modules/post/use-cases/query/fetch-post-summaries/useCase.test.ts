import { describe, expect, it, vi } from 'vitest';
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

    it('uses default values when not provided', async () => {
      const fetchPostSummaries = vi
        .fn()
        .mockResolvedValue({ posts: [], totalCount: 0 });
      const queryService = createMockQueryService({ fetchPostSummaries });
      const sut = new FetchPostSummaries(queryService);

      await sut.execute();

      expect(fetchPostSummaries).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        orderBy: 'desc',
      });
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

    it('passes through PostSummaryOutput from query service', async () => {
      const summary = createPostSummaryOutput({
        id: 'test-uuid',
        title: 'My Title',
        slug: 'test-uuid/my-slug',
      });
      const queryService = createMockQueryService({
        fetchPostSummaries: vi
          .fn()
          .mockResolvedValue({ posts: [summary], totalCount: 1 }),
      });
      const sut = new FetchPostSummaries(queryService);

      const result = await sut.execute();

      expect(result.items[0].id).toBe('test-uuid');
      expect(result.items[0].title).toBe('My Title');
      expect(result.items[0].slug).toBe('test-uuid/my-slug');
    });
  });
});
