import type { Category, Post } from '../../../domain';
import type { SortOrder } from '../../shared';

export interface FetchPostsByCategoryParams {
  category: Category;
  page: number;
  pageSize: number;
  orderBy: SortOrder;
}

export interface FetchPostsByCategoryResult {
  posts: Post[];
  totalCount: number;
}

/**
 * Query service interface for fetching posts by category
 */
export interface FetchPostsByCategoryQueryService {
  fetchPostsByCategory(
    params: FetchPostsByCategoryParams
  ): Promise<FetchPostsByCategoryResult>;
}
