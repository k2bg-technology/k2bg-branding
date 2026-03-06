import { describe, expect, it, vi } from 'vitest';
import { RepositoryError } from '../../../shared';
import {
  createAuthorRecord,
  createPrismaPostsWithAuthor,
} from '../../../shared/testing/factories';
import { PrismaFetchPostSummariesQueryService } from './fetchPostSummariesQueryService';

describe('PrismaFetchPostSummariesQueryService', () => {
  const createMockPrisma = () => ({
    post: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  });

  describe('fetchPostSummaries', () => {
    it('returns paginated post summaries', async () => {
      const mockPrisma = createMockPrisma();
      const prismaPosts = createPrismaPostsWithAuthor(3);
      mockPrisma.post.findMany.mockResolvedValue(prismaPosts);
      mockPrisma.post.count.mockResolvedValue(10);
      const sut = new PrismaFetchPostSummariesQueryService(mockPrisma as never);

      const result = await sut.fetchPostSummaries({
        page: 1,
        pageSize: 10,
        orderBy: 'desc',
      });

      expect(result.posts).toHaveLength(3);
      expect(result.totalCount).toBe(10);
    });

    it('maps to PostSummaryOutput without content', async () => {
      const mockPrisma = createMockPrisma();
      const author = createAuthorRecord();
      const prismaPosts = createPrismaPostsWithAuthor(1);
      mockPrisma.post.findMany.mockResolvedValue(prismaPosts);
      mockPrisma.post.count.mockResolvedValue(1);
      const sut = new PrismaFetchPostSummariesQueryService(mockPrisma as never);

      const result = await sut.fetchPostSummaries({
        page: 1,
        pageSize: 10,
        orderBy: 'desc',
      });

      const summary = result.posts[0];
      expect(summary.id).toBe(prismaPosts[0].uuid);
      expect(summary.title).toBe(prismaPosts[0].title);
      expect(summary.slug).toBe(
        `${prismaPosts[0].uuid}/${prismaPosts[0].slug}`
      );
      expect(summary.author).toEqual({
        id: author.uuid,
        name: author.name,
        avatarUrl: author.avatarUrl,
      });
      expect(summary).not.toHaveProperty('content');
    });

    it('calculates correct skip value for pagination', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);
      const sut = new PrismaFetchPostSummariesQueryService(mockPrisma as never);

      await sut.fetchPostSummaries({ page: 3, pageSize: 10, orderBy: 'desc' });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });

    it('uses select to exclude content', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);
      const sut = new PrismaFetchPostSummariesQueryService(mockPrisma as never);

      await sut.fetchPostSummaries({ page: 1, pageSize: 10, orderBy: 'desc' });

      const callArgs = mockPrisma.post.findMany.mock.calls[0][0];
      expect(callArgs.select).toBeDefined();
      expect(callArgs.select.content).toBeUndefined();
      expect(callArgs.select.uuid).toBe(true);
      expect(callArgs.select.title).toBe(true);
      expect(callArgs.include).toBeUndefined();
    });

    it('filters by ARTICLE type', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);
      const sut = new PrismaFetchPostSummariesQueryService(mockPrisma as never);

      await sut.fetchPostSummaries({ page: 1, pageSize: 10, orderBy: 'desc' });

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
      const sut = new PrismaFetchPostSummariesQueryService(mockPrisma as never);

      await sut.fetchPostSummaries({ page: 1, pageSize: 10, orderBy: 'asc' });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { releaseDate: 'asc' },
        })
      );
    });

    it('throws RepositoryError on database error', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findMany.mockRejectedValue(new Error('DB Error'));
      const sut = new PrismaFetchPostSummariesQueryService(mockPrisma as never);

      await expect(
        sut.fetchPostSummaries({ page: 1, pageSize: 10, orderBy: 'desc' })
      ).rejects.toThrow(RepositoryError);
    });
  });
});
