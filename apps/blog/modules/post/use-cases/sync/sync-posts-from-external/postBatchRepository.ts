import type { Post } from '../../../domain';
import type { AuthorRecord } from './authorRecord';

/**
 * Repository interface for batch post operations
 *
 * Used for syncing posts from external sources
 */
export interface PostBatchRepository {
  /**
   * Upserts multiple posts (insert or update) and their author records
   */
  upsertAll(posts: Post[], authorRecords: AuthorRecord[]): Promise<void>;
}
