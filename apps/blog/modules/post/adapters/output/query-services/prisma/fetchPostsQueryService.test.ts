import { describe, expect, it, vi } from 'vitest';
import { createPrismaPostsWithAuthor, RepositoryError } from '../../../shared';
import { PrismaFetchPostsQueryService } from './fetchPostsQueryService';

describe('PrismaFetchPostsQueryService', () => {
  const createMockPrisma = () => ({
    post: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  });

  describe('fetchPosts', () => {
    it('returns paginated posts', async () => {
      const mockPrisma = createMockPrisma();
      const prismaPosts = createPrismaPostsWithAuthor(3);
      mockPrisma.post.findMany.mockResolvedValue(prismaPosts);
      mockPrisma.post.count.mockResolvedValue(10);
      const sut = new PrismaFetchPostsQueryService(mockPrisma as never);

      const result = await sut.fetchPosts({
        page: 1,
        pageSize: 10,
        orderBy: 'desc',
      });

      expect(result.posts).toHaveLength(3);
      expect(result.totalCount).toBe(10);
    });

    it('calculates correct skip value for pagination', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);
      const sut = new PrismaFetchPostsQueryService(mockPrisma as never);

      await sut.fetchPosts({ page: 3, pageSize: 10, orderBy: 'desc' });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });

    it('filters by ARTICLE type', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);
      const sut = new PrismaFetchPostsQueryService(mockPrisma as never);

      await sut.fetchPosts({ page: 1, pageSize: 10, orderBy: 'desc' });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: 'ARTICLE' },
        })
      );
    });

    it('orders by releaseDate', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);
      const sut = new PrismaFetchPostsQueryService(mockPrisma as never);

      await sut.fetchPosts({ page: 1, pageSize: 10, orderBy: 'asc' });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { releaseDate: 'asc' },
        })
      );
    });

    it('throws RepositoryError on database error', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockRejectedValue(new Error('DB Error'));
      const sut = new PrismaFetchPostsQueryService(mockPrisma as never);

      await expect(
        sut.fetchPosts({ page: 1, pageSize: 10, orderBy: 'desc' })
      ).rejects.toThrow(RepositoryError);
    });
  });
});
