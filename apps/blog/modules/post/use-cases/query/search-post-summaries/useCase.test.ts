import { describe, expect, it, vi } from 'vitest';
import { InvalidPaginationError, InvalidSearchQueryError } from '../../shared';
import {
  createPostSummaryOutput,
  createPostSummaryOutputs,
} from '../../shared/testing/factories';
import type { SearchPostSummariesQueryService } from './queryService';
import { SearchPostSummaries } from './useCase';

describe('SearchPostSummaries', () => {
  const createMockQueryService = (
    overrides: Partial<SearchPostSummariesQueryService> = {}
  ): SearchPostSummariesQueryService => ({
    searchPostSummaries: vi
      .fn()
      .mockResolvedValue({ posts: [], totalCount: 0 }),
    ...overrides,
  });

  describe('execute', () => {
    it('returns search results with pagination', async () => {
      const posts = createPostSummaryOutputs(3);
      const queryService = createMockQueryService({
        searchPostSummaries: vi
          .fn()
          .mockResolvedValue({ posts, totalCount: 3 }),
      });
      const sut = new SearchPostSummaries(queryService);

      const result = await sut.execute({ query: 'typescript' });

      expect(result.items).toHaveLength(3);
      expect(result.totalCount).toBe(3);
    });

    it('trims and passes query to service', async () => {
      const searchPostSummaries = vi
        .fn()
        .mockResolvedValue({ posts: [], totalCount: 0 });
      const queryService = createMockQueryService({ searchPostSummaries });
      const sut = new SearchPostSummaries(queryService);

      await sut.execute({ query: '  typescript  ' });

      expect(searchPostSummaries).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'typescript' })
      );
    });

    it('uses default pagination values', async () => {
      const searchPostSummaries = vi
        .fn()
        .mockResolvedValue({ posts: [], totalCount: 0 });
      const queryService = createMockQueryService({ searchPostSummaries });
      const sut = new SearchPostSummaries(queryService);

      await sut.execute({ query: 'test' });

      expect(searchPostSummaries).toHaveBeenCalledWith({
        query: 'test',
        page: 1,
        pageSize: 10,
        orderBy: 'desc',
      });
    });

    it('allows short queries when MIN_QUERY_LENGTH is 0', async () => {
      const queryService = createMockQueryService();
      const sut = new SearchPostSummaries(queryService);

      const result = await sut.execute({ query: 'a' });

      expect(result.items).toEqual([]);
    });

    it('throws InvalidSearchQueryError when query is too long', async () => {
      const queryService = createMockQueryService();
      const sut = new SearchPostSummaries(queryService);
      const longQuery = 'a'.repeat(101);

      await expect(sut.execute({ query: longQuery })).rejects.toThrow(
        InvalidSearchQueryError
      );
    });

    it('allows empty query after trimming when MIN_QUERY_LENGTH is 0', async () => {
      const queryService = createMockQueryService();
      const sut = new SearchPostSummaries(queryService);

      const result = await sut.execute({ query: '   ' });

      expect(result.items).toEqual([]);
    });

    it('throws InvalidPaginationError when page is less than 1', async () => {
      const queryService = createMockQueryService();
      const sut = new SearchPostSummaries(queryService);

      await expect(sut.execute({ query: 'test', page: 0 })).rejects.toThrow(
        InvalidPaginationError
      );
    });

    it('calculates pagination correctly', async () => {
      const queryService = createMockQueryService({
        searchPostSummaries: vi
          .fn()
          .mockResolvedValue({ posts: [], totalCount: 25 }),
      });
      const sut = new SearchPostSummaries(queryService);

      const result = await sut.execute({
        query: 'test',
        page: 3,
        pageSize: 5,
      });

      expect(result.totalPages).toBe(5);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
    });

    it('passes through PostSummaryOutput from query service', async () => {
      const summary = createPostSummaryOutput({ id: 'test-uuid' });
      const queryService = createMockQueryService({
        searchPostSummaries: vi
          .fn()
          .mockResolvedValue({ posts: [summary], totalCount: 1 }),
      });
      const sut = new SearchPostSummaries(queryService);

      const result = await sut.execute({ query: 'test' });

      expect(result.items[0].id).toBe('test-uuid');
    });
  });
});
