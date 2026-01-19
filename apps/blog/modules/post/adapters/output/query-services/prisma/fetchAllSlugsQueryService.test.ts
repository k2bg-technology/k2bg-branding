import { describe, expect, it, vi } from 'vitest';
import { RepositoryError } from '../../../shared';
import { PrismaFetchAllSlugsQueryService } from './fetchAllSlugsQueryService';

describe('PrismaFetchAllSlugsQueryService', () => {
  const createMockPrisma = () => ({
    post: {
      findMany: vi.fn(),
    },
  });

  describe('fetchAllSlugs', () => {
    it('returns all slugs', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([
        { uuid: 'uuid-1', slug: 'post-1' },
        { uuid: 'uuid-2', slug: 'post-2' },
        { uuid: 'uuid-3', slug: 'post-3' },
      ]);
      const sut = new PrismaFetchAllSlugsQueryService(mockPrisma as never);

      const result = await sut.fetchAllSlugs({ orderBy: 'desc' });

      expect(result).toEqual([
        { id: 'uuid-1', slug: 'post-1' },
        { id: 'uuid-2', slug: 'post-2' },
        { id: 'uuid-3', slug: 'post-3' },
      ]);
    });

    it('filters by ARTICLE type', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      const sut = new PrismaFetchAllSlugsQueryService(mockPrisma as never);

      await sut.fetchAllSlugs({ orderBy: 'desc' });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: 'ARTICLE' },
        })
      );
    });

    it('selects only uuid and slug fields', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      const sut = new PrismaFetchAllSlugsQueryService(mockPrisma as never);

      await sut.fetchAllSlugs({ orderBy: 'desc' });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: { uuid: true, slug: true },
        })
      );
    });

    it('orders by releaseDate ascending', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      const sut = new PrismaFetchAllSlugsQueryService(mockPrisma as never);

      await sut.fetchAllSlugs({ orderBy: 'asc' });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { releaseDate: 'asc' },
        })
      );
    });

    it('orders by releaseDate descending', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      const sut = new PrismaFetchAllSlugsQueryService(mockPrisma as never);

      await sut.fetchAllSlugs({ orderBy: 'desc' });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { releaseDate: 'desc' },
        })
      );
    });

    it('returns empty array when no posts exist', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      const sut = new PrismaFetchAllSlugsQueryService(mockPrisma as never);

      const result = await sut.fetchAllSlugs({ orderBy: 'desc' });

      expect(result).toEqual([]);
    });

    it('throws RepositoryError on database error', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockRejectedValue(new Error('DB Error'));
      const sut = new PrismaFetchAllSlugsQueryService(mockPrisma as never);

      await expect(sut.fetchAllSlugs({ orderBy: 'desc' })).rejects.toThrow(
        RepositoryError
      );
    });
  });
});
