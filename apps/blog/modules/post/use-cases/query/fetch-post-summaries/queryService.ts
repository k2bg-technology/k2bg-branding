import type { PostSummaryOutput, SortOrder } from '../../shared';

export interface FetchPostSummariesParams {
  page: number;
  pageSize: number;
  orderBy: SortOrder;
}

export interface FetchPostSummariesResult {
  posts: PostSummaryOutput[];
  totalCount: number;
}

/**
 * Query service interface for fetching paginated post summaries
 */
export interface FetchPostSummariesQueryService {
  fetchPostSummaries(
    params: FetchPostSummariesParams
  ): Promise<FetchPostSummariesResult>;
}
