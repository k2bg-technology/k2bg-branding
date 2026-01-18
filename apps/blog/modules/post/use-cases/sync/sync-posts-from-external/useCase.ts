import { type PostOutput, SyncError, toPostOutput } from '../../shared';
import type { ExternalPostSource } from './externalPostSource';
import type { PostBatchRepository } from './postBatchRepository';

export interface SyncPostsFromExternalOutput {
  syncedPosts: PostOutput[];
  count: number;
}

/**
 * SyncPostsFromExternal Use Case
 *
 * Syncs posts from an external source to the local database.
 */
export class SyncPostsFromExternal {
  constructor(
    private readonly externalSource: ExternalPostSource,
    private readonly batchRepository: PostBatchRepository
  ) {}

  async execute(): Promise<SyncPostsFromExternalOutput> {
    try {
      const posts = await this.externalSource.fetchAllPosts();

      if (posts.length > 0) {
        await this.batchRepository.upsertAll(posts);
      }

      return {
        syncedPosts: posts.map(toPostOutput),
        count: posts.length,
      };
    } catch (error) {
      if (error instanceof SyncError) {
        throw error;
      }
      throw new SyncError(
        `Failed to sync posts from external source: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
