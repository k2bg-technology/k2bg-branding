import { describe, expect, it, vi } from 'vitest';
import { Category } from '../../../../domain';
import { createPrismaPostsWithAuthor, RepositoryError } from '../../../shared';
import { PrismaFetchPostsByCategoryQueryService } from './fetchPostsByCategoryQueryService';

describe('PrismaFetchPostsByCategoryQueryService', () => {
  const createMockPrisma = () => ({
    post: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  });

  describe('fetchPostsByCategory', () => {
    it('returns paginated posts filtered by category', async () => {
      const mockPrisma = createMockPrisma();
      const prismaPosts = createPrismaPostsWithAuthor(2);
      mockPrisma.post.findMany.mockResolvedValue(prismaPosts);
      mockPrisma.post.count.mockResolvedValue(5);
      const sut = new PrismaFetchPostsByCategoryQueryService(
        mockPrisma as never
      );

      const result = await sut.fetchPostsByCategory({
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
      const sut = new PrismaFetchPostsByCategoryQueryService(
        mockPrisma as never
      );

      await sut.fetchPostsByCategory({
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

    it('calculates correct skip value for pagination', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);
      const sut = new PrismaFetchPostsByCategoryQueryService(
        mockPrisma as never
      );

      await sut.fetchPostsByCategory({
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
      const sut = new PrismaFetchPostsByCategoryQueryService(
        mockPrisma as never
      );

      await sut.fetchPostsByCategory({
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
      const sut = new PrismaFetchPostsByCategoryQueryService(
        mockPrisma as never
      );

      await expect(
        sut.fetchPostsByCategory({
          category: Category.ENGINEERING,
          page: 1,
          pageSize: 10,
          orderBy: 'desc',
        })
      ).rejects.toThrow(RepositoryError);
    });
  });
});
