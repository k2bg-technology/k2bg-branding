import type { Post } from '../../../domain';
import type { SortOrder } from '../../shared';

export interface SearchPostsParams {
  query: string;
  page: number;
  pageSize: number;
  orderBy: SortOrder;
}

export interface SearchPostsResult {
  posts: Post[];
  totalCount: number;
}

/**
 * Query service interface for searching posts
 */
export interface SearchPostsQueryService {
  searchPosts(params: SearchPostsParams): Promise<SearchPostsResult>;
}
