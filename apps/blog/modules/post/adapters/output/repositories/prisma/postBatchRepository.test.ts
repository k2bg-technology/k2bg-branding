import { describe, expect, it, vi } from 'vitest';
import { createPosts } from '../../../../use-cases/shared/testing/factories';
import { RepositoryError } from '../../../shared';
import { PrismaPostBatchRepository } from './postBatchRepository';

describe('PrismaPostBatchRepository', () => {
  const createMockPrisma = () => ({
    $transaction: vi.fn(),
    post: {
      upsert: vi.fn(),
    },
  });

  describe('upsertAll', () => {
    it('does nothing when posts array is empty', async () => {
      const mockPrisma = createMockPrisma();
      const sut = new PrismaPostBatchRepository(mockPrisma as never);

      await sut.upsertAll([]);

      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('upserts all posts in a transaction', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.$transaction.mockResolvedValue([]);
      mockPrisma.post.upsert.mockReturnValue(Promise.resolve({}));
      const sut = new PrismaPostBatchRepository(mockPrisma as never);
      const posts = createPosts(3);

      await sut.upsertAll(posts);

      expect(mockPrisma.$transaction).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.any(Promise),
          expect.any(Promise),
          expect.any(Promise),
        ])
      );
    });

    it('throws RepositoryError on transaction failure', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.$transaction.mockRejectedValue(
        new Error('Transaction failed')
      );
      const sut = new PrismaPostBatchRepository(mockPrisma as never);
      const posts = createPosts(2);

      await expect(sut.upsertAll(posts)).rejects.toThrow(RepositoryError);
    });

    it('includes correct error message with post count', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.$transaction.mockRejectedValue(
        new Error('Transaction failed')
      );
      const sut = new PrismaPostBatchRepository(mockPrisma as never);
      const posts = createPosts(5);

      await expect(sut.upsertAll(posts)).rejects.toThrow(
        'Failed to upsert 5 posts'
      );
    });
  });
});
