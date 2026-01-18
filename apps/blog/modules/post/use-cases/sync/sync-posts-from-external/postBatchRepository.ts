import type { Post } from '../../../domain';

/**
 * Repository interface for batch post operations
 *
 * Used for syncing posts from external sources
 */
export interface PostBatchRepository {
  /**
   * Upserts multiple posts (insert or update)
   */
  upsertAll(posts: Post[]): Promise<void>;
}
