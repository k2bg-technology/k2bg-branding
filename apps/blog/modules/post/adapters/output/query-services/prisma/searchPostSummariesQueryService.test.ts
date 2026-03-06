import { describe, expect, it, vi } from 'vitest';
import { RepositoryError } from '../../../shared';
import { createPrismaPostsWithAuthor } from '../../../shared/testing/factories';
import { PrismaSearchPostSummariesQueryService } from './searchPostSummariesQueryService';

describe('PrismaSearchPostSummariesQueryService', () => {
  const createMockPrisma = () => ({
    post: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  });

  describe('searchPostSummaries', () => {
    it('returns paginated search results', async () => {
      const mockPrisma = createMockPrisma();
      const prismaPosts = createPrismaPostsWithAuthor(2);
      mockPrisma.post.findMany.mockResolvedValue(prismaPosts);
      mockPrisma.post.count.mockResolvedValue(5);
      const sut = new PrismaSearchPostSummariesQueryService(
        mockPrisma as never
      );

      const result = await sut.searchPostSummaries({
        query: 'test',
        page: 1,
        pageSize: 10,
        orderBy: 'desc',
      });

      expect(result.posts).toHaveLength(2);
      expect(result.totalCount).toBe(5);
    });

    it('searches by title with case-insensitive matching', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);
      const sut = new PrismaSearchPostSummariesQueryService(
        mockPrisma as never
      );

      await sut.searchPostSummaries({
        query: 'TypeScript',
        page: 1,
        pageSize: 10,
        orderBy: 'desc',
      });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: {
              contains: 'TypeScript',
              mode: 'insensitive',
            },
          }),
        })
      );
    });

    it('filters by ARTICLE type', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);
      const sut = new PrismaSearchPostSummariesQueryService(
        mockPrisma as never
      );

      await sut.searchPostSummaries({
        query: 'test',
        page: 1,
        pageSize: 10,
        orderBy: 'desc',
      });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'ARTICLE',
          }),
        })
      );
    });

    it('uses select to exclude content', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);
      const sut = new PrismaSearchPostSummariesQueryService(
        mockPrisma as never
      );

      await sut.searchPostSummaries({
        query: 'test',
        page: 1,
        pageSize: 10,
        orderBy: 'desc',
      });

      const callArgs = mockPrisma.post.findMany.mock.calls[0][0];
      expect(callArgs.select).toBeDefined();
      expect(callArgs.select.content).toBeUndefined();
      expect(callArgs.include).toBeUndefined();
    });

    it('calculates correct skip value for pagination', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);
      const sut = new PrismaSearchPostSummariesQueryService(
        mockPrisma as never
      );

      await sut.searchPostSummaries({
        query: 'test',
        page: 3,
        pageSize: 5,
        orderBy: 'desc',
      });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 5,
        })
      );
    });

    it('orders by releaseDate', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);
      const sut = new PrismaSearchPostSummariesQueryService(
        mockPrisma as never
      );

      await sut.searchPostSummaries({
        query: 'test',
        page: 1,
        pageSize: 10,
        orderBy: 'asc',
      });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { releaseDate: 'asc' },
        })
      );
    });

    it('returns empty results when no matches found', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);
      const sut = new PrismaSearchPostSummariesQueryService(
        mockPrisma as never
      );

      const result = await sut.searchPostSummaries({
        query: 'nonexistent',
        page: 1,
        pageSize: 10,
        orderBy: 'desc',
      });

      expect(result.posts).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('throws RepositoryError on database error', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockRejectedValue(new Error('DB Error'));
      const sut = new PrismaSearchPostSummariesQueryService(
        mockPrisma as never
      );

      await expect(
        sut.searchPostSummaries({
          query: 'test',
          page: 1,
          pageSize: 10,
          orderBy: 'desc',
        })
      ).rejects.toThrow(RepositoryError);
    });

    it('includes query in error message', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockRejectedValue(new Error('DB Error'));
      const sut = new PrismaSearchPostSummariesQueryService(
        mockPrisma as never
      );

      await expect(
        sut.searchPostSummaries({
          query: 'my-search-term',
          page: 1,
          pageSize: 10,
          orderBy: 'desc',
        })
      ).rejects.toThrow('my-search-term');
    });
  });
});
