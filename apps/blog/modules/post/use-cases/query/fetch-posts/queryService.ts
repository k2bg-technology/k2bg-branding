import type { Post } from '../../../domain';
import type { AuthorOutput, SortOrder } from '../../shared';

export interface FetchPostsParams {
  page: number;
  pageSize: number;
  orderBy: SortOrder;
}

export interface PostWithAuthor {
  post: Post;
  author: AuthorOutput | null;
}

export interface FetchPostsResult {
  posts: PostWithAuthor[];
  totalCount: number;
}

/**
 * Query service interface for fetching paginated posts
 */
export interface FetchPostsQueryService {
  fetchPosts(params: FetchPostsParams): Promise<FetchPostsResult>;
}
