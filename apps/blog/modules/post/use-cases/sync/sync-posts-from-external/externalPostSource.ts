import type { Post } from '../../../domain';

/**
 * External post source interface
 *
 * Abstracts the source of posts
 */
export interface ExternalPostSource {
  /**
   * Fetches all posts from the external source
   */
  fetchAllPosts(): Promise<Post[]>;
}
