import { describe, expect, it, vi } from 'vitest';
import { PostId } from '../../../domain';
import type { AuthorOutput } from '../../shared';
import { PostNotFoundError } from '../../shared';
import { createPost } from '../../shared/testing/factories';
import type { FetchPostQueryService } from './queryService';
import { FetchPost } from './useCase';

describe('FetchPost', () => {
  const createMockQueryService = (
    overrides: Partial<FetchPostQueryService> = {}
  ): FetchPostQueryService => ({
    fetchPost: vi.fn().mockResolvedValue(null),
    ...overrides,
  });

  const createMockAuthor = (): AuthorOutput => ({
    id: '660e8400-e29b-41d4-a716-446655440000',
    name: 'Test Author',
    avatarUrl: 'https://example.com/avatar.jpg',
  });

  describe('execute', () => {
    it('returns post when found', async () => {
      const post = createPost();
      const author = createMockAuthor();
      const queryService = createMockQueryService({
        fetchPost: vi.fn().mockResolvedValue({ post, author }),
      });
      const sut = new FetchPost(queryService);

      const result = await sut.execute({ id: post.id.getValue() });

      expect(result.post.id).toBe(post.id.getValue());
      expect(result.post.title).toBe(post.title.getValue());
      expect(result.post.author).toEqual(author);
    });

    it('returns post with null author when author not available', async () => {
      const post = createPost();
      const queryService = createMockQueryService({
        fetchPost: vi.fn().mockResolvedValue({ post, author: null }),
      });
      const sut = new FetchPost(queryService);

      const result = await sut.execute({ id: post.id.getValue() });

      expect(result.post.id).toBe(post.id.getValue());
      expect(result.post.author).toBeNull();
    });

    it('throws PostNotFoundError when post does not exist', async () => {
      const queryService = createMockQueryService({
        fetchPost: vi.fn().mockResolvedValue(null),
      });
      const sut = new FetchPost(queryService);

      await expect(
        sut.execute({ id: '550e8400-e29b-41d4-a716-446655440000' })
      ).rejects.toThrow(PostNotFoundError);
    });

    it('returns the post selected by its requested ID', async () => {
      const selectedId = '660e8400-e29b-41d4-a716-446655440000';
      const selected = createPost({ id: PostId.create(selectedId) });
      const other = createPost({
        id: PostId.create('550e8400-e29b-41d4-a716-446655440000'),
      });
      const records = new Map([
        [other.id.getValue(), { post: other, author: null }],
        [selectedId, { post: selected, author: null }],
      ]);
      const queryService: FetchPostQueryService = {
        fetchPost: async (id) => records.get(id.getValue()) ?? null,
      };
      const sut = new FetchPost(queryService);

      const result = await sut.execute({ id: selectedId });

      expect(result.post.id).toBe(selectedId);
    });
  });
});
