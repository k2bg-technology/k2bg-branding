import type { Post, PostId } from '../../../domain';
import type { AuthorOutput } from '../../shared';

export interface PostWithAuthor {
  post: Post;
  author: AuthorOutput | null;
}

/**
 * Query service interface for fetching a single post with author
 */
export interface FetchPostQueryService {
  fetchPost(id: PostId): Promise<PostWithAuthor | null>;
}
