import { describe, expect, it, vi } from 'vitest';
import { PostId } from '../../../../domain';
import { createPrismaPostWithAuthor, RepositoryError } from '../../../shared';
import { PrismaFetchPostQueryService } from './fetchPostQueryService';

describe('PrismaFetchPostQueryService', () => {
  const createMockPrisma = () => ({
    post: {
      findUnique: vi.fn(),
    },
  });

  describe('fetchPost', () => {
    it('returns post with author when found', async () => {
      const mockPrisma = createMockPrisma();
      const prismaPost = createPrismaPostWithAuthor();
      mockPrisma.post.findUnique.mockResolvedValue(prismaPost);
      const sut = new PrismaFetchPostQueryService(mockPrisma as never);
      const postId = PostId.create(prismaPost.uuid);

      const result = await sut.fetchPost(postId);

      expect(result).not.toBeNull();
      expect(result?.post.id.getValue()).toBe(prismaPost.uuid);
      expect(result?.author).toEqual({
        id: prismaPost.author.uuid,
        name: prismaPost.author.name,
        avatarUrl: prismaPost.author.avatarUrl,
      });
    });

    it('returns null when post not found', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findUnique.mockResolvedValue(null);
      const sut = new PrismaFetchPostQueryService(mockPrisma as never);
      const postId = PostId.create('550e8400-e29b-41d4-a716-446655440000');

      const result = await sut.fetchPost(postId);

      expect(result).toBeNull();
    });

    it('queries by uuid with author included', async () => {
      const mockPrisma = createMockPrisma();
      const prismaPost = createPrismaPostWithAuthor();
      mockPrisma.post.findUnique.mockResolvedValue(prismaPost);
      const sut = new PrismaFetchPostQueryService(mockPrisma as never);
      const postId = PostId.create(prismaPost.uuid);

      await sut.fetchPost(postId);

      expect(mockPrisma.post.findUnique).toHaveBeenCalledWith({
        where: { uuid: postId.getValue() },
        include: { author: true },
      });
    });

    it('returns null author when post has no author', async () => {
      const mockPrisma = createMockPrisma();
      const prismaPost = { ...createPrismaPostWithAuthor(), author: null };
      mockPrisma.post.findUnique.mockResolvedValue(prismaPost);
      const sut = new PrismaFetchPostQueryService(mockPrisma as never);
      const postId = PostId.create(prismaPost.uuid);

      const result = await sut.fetchPost(postId);

      expect(result).not.toBeNull();
      expect(result?.author).toBeNull();
    });

    it('throws RepositoryError on database error', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findUnique.mockRejectedValue(new Error('DB Error'));
      const sut = new PrismaFetchPostQueryService(mockPrisma as never);
      const postId = PostId.create('550e8400-e29b-41d4-a716-446655440000');

      await expect(sut.fetchPost(postId)).rejects.toThrow(RepositoryError);
    });
  });
});
