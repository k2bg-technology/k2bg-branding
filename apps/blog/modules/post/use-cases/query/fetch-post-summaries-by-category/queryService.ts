import type { Category } from '../../../domain';
import type { PostSummaryOutput, SortOrder } from '../../shared';

export interface FetchPostSummariesByCategoryParams {
  category: Category;
  page: number;
  pageSize: number;
  orderBy: SortOrder;
}

export interface FetchPostSummariesByCategoryResult {
  posts: PostSummaryOutput[];
  totalCount: number;
}

/**
 * Query service interface for fetching post summaries by category
 */
export interface FetchPostSummariesByCategoryQueryService {
  fetchPostSummariesByCategory(
    params: FetchPostSummariesByCategoryParams
  ): Promise<FetchPostSummariesByCategoryResult>;
}
