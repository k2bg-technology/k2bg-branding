import { describe, expect, it, vi } from 'vitest';
import { PostId } from '../../../../domain';
import { createPost } from '../../../../use-cases/shared/testing/factories';
import { createPrismaPostWithAuthor, RepositoryError } from '../../../shared';
import { PrismaPostRepository } from './postRepository';

describe('PrismaPostRepository', () => {
  const createMockPrisma = () => ({
    post: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  });

  describe('findById', () => {
    it('returns Post when found', async () => {
      const mockPrisma = createMockPrisma();
      const prismaPost = createPrismaPostWithAuthor();
      mockPrisma.post.findUnique.mockResolvedValue(prismaPost);
      const sut = new PrismaPostRepository(mockPrisma as never);
      const postId = PostId.create(prismaPost.uuid);

      const result = await sut.findById(postId);

      expect(result).not.toBeNull();
      expect(result?.id.getValue()).toBe(prismaPost.uuid);
      expect(mockPrisma.post.findUnique).toHaveBeenCalledWith({
        where: { uuid: prismaPost.uuid },
        include: { author: true },
      });
    });

    it('returns null when not found', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findUnique.mockResolvedValue(null);
      const sut = new PrismaPostRepository(mockPrisma as never);
      const postId = PostId.create('00000000-0000-4000-a000-000000000001');

      const result = await sut.findById(postId);

      expect(result).toBeNull();
    });

    it('throws RepositoryError on database error', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.findUnique.mockRejectedValue(new Error('DB Error'));
      const sut = new PrismaPostRepository(mockPrisma as never);
      const postId = PostId.create('00000000-0000-4000-a000-000000000002');

      await expect(sut.findById(postId)).rejects.toThrow(RepositoryError);
    });
  });

  describe('save', () => {
    it('upserts post data', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.upsert.mockResolvedValue({});
      const sut = new PrismaPostRepository(mockPrisma as never);
      const post = createPost();

      await sut.save(post);

      expect(mockPrisma.post.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { uuid: post.id.getValue() },
          update: expect.objectContaining({
            title: post.title.getValue(),
            content: post.content.getValue(),
          }),
          create: expect.objectContaining({
            uuid: post.id.getValue(),
            title: post.title.getValue(),
          }),
        })
      );
    });

    it('throws RepositoryError on database error', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.upsert.mockRejectedValue(new Error('DB Error'));
      const sut = new PrismaPostRepository(mockPrisma as never);
      const post = createPost();

      await expect(sut.save(post)).rejects.toThrow(RepositoryError);
    });
  });

  describe('delete', () => {
    it('deletes post by id', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.delete.mockResolvedValue({});
      const sut = new PrismaPostRepository(mockPrisma as never);
      const postId = PostId.create('00000000-0000-4000-a000-000000000003');

      await sut.delete(postId);

      expect(mockPrisma.post.delete).toHaveBeenCalledWith({
        where: { uuid: '00000000-0000-4000-a000-000000000003' },
      });
    });

    it('throws RepositoryError on database error', async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.post.delete.mockRejectedValue(new Error('DB Error'));
      const sut = new PrismaPostRepository(mockPrisma as never);
      const postId = PostId.create('00000000-0000-4000-a000-000000000004');

      await expect(sut.delete(postId)).rejects.toThrow(RepositoryError);
    });
  });
});
