import { describe, expect, it, vi } from 'vitest';
import { SyncError } from '../../shared';
import { createPost, createPosts } from '../../shared/testing/factories';
import type { ExternalPostSource } from './externalPostSource';
import type { PostBatchRepository } from './postBatchRepository';
import { SyncPostsFromExternal } from './useCase';

describe('SyncPostsFromExternal', () => {
  const createMockExternalSource = (
    overrides: Partial<ExternalPostSource> = {}
  ): ExternalPostSource => ({
    fetchAllPosts: vi.fn().mockResolvedValue([]),
    ...overrides,
  });

  const createMockBatchRepository = (
    overrides: Partial<PostBatchRepository> = {}
  ): PostBatchRepository => ({
    upsertAll: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  describe('execute', () => {
    it('syncs posts from external source', async () => {
      const posts = createPosts(3);
      const externalSource = createMockExternalSource({
        fetchAllPosts: vi.fn().mockResolvedValue(posts),
      });
      const batchRepository = createMockBatchRepository();
      const sut = new SyncPostsFromExternal(externalSource, batchRepository);

      const result = await sut.execute();

      expect(result.count).toBe(3);
      expect(result.syncedPosts).toHaveLength(3);
    });

    it('calls upsertAll with fetched posts', async () => {
      const posts = createPosts(2);
      const externalSource = createMockExternalSource({
        fetchAllPosts: vi.fn().mockResolvedValue(posts),
      });
      const upsertAll = vi.fn().mockResolvedValue(undefined);
      const batchRepository = createMockBatchRepository({ upsertAll });
      const sut = new SyncPostsFromExternal(externalSource, batchRepository);

      await sut.execute();

      expect(upsertAll).toHaveBeenCalledWith(posts);
    });

    it('does not call upsertAll when no posts are found', async () => {
      const externalSource = createMockExternalSource({
        fetchAllPosts: vi.fn().mockResolvedValue([]),
      });
      const upsertAll = vi.fn();
      const batchRepository = createMockBatchRepository({ upsertAll });
      const sut = new SyncPostsFromExternal(externalSource, batchRepository);

      const result = await sut.execute();

      expect(upsertAll).not.toHaveBeenCalled();
      expect(result.count).toBe(0);
    });

    it('throws SyncError when external source fails', async () => {
      const externalSource = createMockExternalSource({
        fetchAllPosts: vi.fn().mockRejectedValue(new Error('API error')),
      });
      const batchRepository = createMockBatchRepository();
      const sut = new SyncPostsFromExternal(externalSource, batchRepository);

      await expect(sut.execute()).rejects.toThrow(SyncError);
      await expect(sut.execute()).rejects.toThrow('API error');
    });

    it('throws SyncError when batch repository fails', async () => {
      const posts = createPosts(1);
      const externalSource = createMockExternalSource({
        fetchAllPosts: vi.fn().mockResolvedValue(posts),
      });
      const batchRepository = createMockBatchRepository({
        upsertAll: vi.fn().mockRejectedValue(new Error('Database error')),
      });
      const sut = new SyncPostsFromExternal(externalSource, batchRepository);

      await expect(sut.execute()).rejects.toThrow(SyncError);
      await expect(sut.execute()).rejects.toThrow('Database error');
    });

    it('maps synced posts to PostOutput', async () => {
      const post = createPost();
      const externalSource = createMockExternalSource({
        fetchAllPosts: vi.fn().mockResolvedValue([post]),
      });
      const batchRepository = createMockBatchRepository();
      const sut = new SyncPostsFromExternal(externalSource, batchRepository);

      const result = await sut.execute();

      expect(result.syncedPosts[0].id).toBe(post.id.getValue());
      expect(result.syncedPosts[0].title).toBe(post.title.getValue());
    });
  });
});
