import type { Post } from '../../../domain';
import type { AuthorRecord } from './authorRecord';

export interface ExternalPostBatch {
  posts: Post[];
  authors: AuthorRecord[];
}

/**
 * External post source interface
 *
 * Abstracts the source of posts and their authors
 */
export interface ExternalPostSource {
  /**
   * Fetches all posts and their author records from the external source
   */
  fetchAll(): Promise<ExternalPostBatch>;
}
