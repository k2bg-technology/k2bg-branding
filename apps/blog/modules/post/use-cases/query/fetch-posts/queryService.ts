import type { Post } from '../../../domain';
import type { SortOrder } from '../../shared';

export interface FetchPostsParams {
  page: number;
  pageSize: number;
  orderBy: SortOrder;
}

export interface FetchPostsResult {
  posts: Post[];
  totalCount: number;
}

/**
 * Query service interface for fetching paginated posts
 */
export interface FetchPostsQueryService {
  fetchPosts(params: FetchPostsParams): Promise<FetchPostsResult>;
}
