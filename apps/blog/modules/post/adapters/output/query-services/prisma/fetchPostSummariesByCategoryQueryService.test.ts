import { describe, expect, it, vi } from 'vitest';
import { Category } from '../../../../domain';
import { RepositoryError } from '../../../shared';
import { createPrismaPostsWithAuthor } from '../../../shared/testing/factories';
import { PrismaFetchPostSummariesByCategoryQueryService } from './fetchPostSummariesByCategoryQueryService';

describe('PrismaFetchPostSummariesByCategoryQueryService', () => {
  const createMockPrisma = () => ({
    post: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  });

  describe('fetchPostSummariesByCategory', () => {
    it('returns paginated post summaries filtered by category', async () => {
      const mockPrisma = createMockPrisma();
      const prismaPosts = createPrismaPostsWithAuthor(2);
      mockPrisma.post.findMany.mockResolvedValue(prismaPosts);
      mockPrisma.post.count.mockResolvedValue(5);
      const sut = new PrismaFetchPostSummariesByCategoryQueryService(
        mockPrisma as never
      );

      const result = await sut.fetchPostSummariesByCategory({
        category: Category.ENGINEERING,
        page: 1,
        pageSize: 10,
        orderBy: 'desc',
      });

      expect(result.posts).toHaveLength(2);
      expect(result.totalCount).toBe(5);
    });

    it('filters by category and ARTICLE type', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);
      const sut = new PrismaFetchPostSummariesByCategoryQueryService(
        mockPrisma as never
      );

      await sut.fetchPostSummariesByCategory({
        category: Category.DESIGN,
        page: 1,
        pageSize: 10,
        orderBy: 'desc',
      });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            type: 'ARTICLE',
            category: Category.DESIGN,
          },
        })
      );
    });

    it('uses select to exclude content', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);
      const sut = new PrismaFetchPostSummariesByCategoryQueryService(
        mockPrisma as never
      );

      await sut.fetchPostSummariesByCategory({
        category: Category.ENGINEERING,
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
      const sut = new PrismaFetchPostSummariesByCategoryQueryService(
        mockPrisma as never
      );

      await sut.fetchPostSummariesByCategory({
        category: Category.ENGINEERING,
        page: 2,
        pageSize: 5,
        orderBy: 'desc',
      });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      );
    });

    it('orders by releaseDate', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);
      const sut = new PrismaFetchPostSummariesByCategoryQueryService(
        mockPrisma as never
      );

      await sut.fetchPostSummariesByCategory({
        category: Category.ENGINEERING,
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

    it('throws RepositoryError on database error', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockRejectedValue(new Error('DB Error'));
      const sut = new PrismaFetchPostSummariesByCategoryQueryService(
        mockPrisma as never
      );

      await expect(
        sut.fetchPostSummariesByCategory({
          category: Category.ENGINEERING,
          page: 1,
          pageSize: 10,
          orderBy: 'desc',
        })
      ).rejects.toThrow(RepositoryError);
    });
  });
});
