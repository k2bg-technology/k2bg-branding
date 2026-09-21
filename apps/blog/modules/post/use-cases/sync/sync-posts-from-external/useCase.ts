import { type PostOutput, SyncError, toPostOutput } from '../../shared';
import type { ExternalPostSource } from './externalPostSource';
import type { PostBatchRepository } from './postBatchRepository';

export interface SyncPostsFromExternalOutput {
  syncedPosts: PostOutput[];
  count: number;
}

export class SyncPostsFromExternal {
  constructor(
    private readonly externalSource: ExternalPostSource,
    private readonly batchRepository: PostBatchRepository
  ) {}

  async execute(): Promise<SyncPostsFromExternalOutput> {
    try {
      const { posts, authors } = await this.externalSource.fetchAll();

      if (posts.length > 0) {
        await this.batchRepository.upsertAll(posts, authors);
      }

      return {
        syncedPosts: posts.map((post) => toPostOutput(post, null)),
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
