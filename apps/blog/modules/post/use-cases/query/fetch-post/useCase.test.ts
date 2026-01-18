import { describe, expect, it, vi } from 'vitest';
import type { PostRepository } from '../../../domain';
import { PostNotFoundError } from '../../shared';
import { createPost } from '../../shared/testing/factories';
import { FetchPost } from './useCase';

describe('FetchPost', () => {
  const createMockRepository = (
    overrides: Partial<PostRepository> = {}
  ): PostRepository => ({
    findById: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  });

  describe('execute', () => {
    it('returns post when found', async () => {
      const post = createPost();
      const repository = createMockRepository({
        findById: vi.fn().mockResolvedValue(post),
      });
      const sut = new FetchPost(repository);

      const result = await sut.execute({ id: post.id.getValue() });

      expect(result.post.id).toBe(post.id.getValue());
      expect(result.post.title).toBe(post.title.getValue());
    });

    it('throws PostNotFoundError when post does not exist', async () => {
      const repository = createMockRepository({
        findById: vi.fn().mockResolvedValue(null),
      });
      const sut = new FetchPost(repository);

      await expect(
        sut.execute({ id: '550e8400-e29b-41d4-a716-446655440000' })
      ).rejects.toThrow(PostNotFoundError);
    });

    it('calls repository with correct PostId', async () => {
      const post = createPost();
      const findById = vi.fn().mockResolvedValue(post);
      const repository = createMockRepository({ findById });
      const sut = new FetchPost(repository);

      await sut.execute({ id: post.id.getValue() });

      expect(findById).toHaveBeenCalledTimes(1);
      const calledPostId = findById.mock.calls[0][0];
      expect(calledPostId.getValue()).toBe(post.id.getValue());
    });
  });
});
