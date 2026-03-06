import type { PostSummaryOutput, SortOrder } from '../../shared';

export interface SearchPostSummariesParams {
  query: string;
  page: number;
  pageSize: number;
  orderBy: SortOrder;
}

export interface SearchPostSummariesResult {
  posts: PostSummaryOutput[];
  totalCount: number;
}

/**
 * Query service interface for searching post summaries
 */
export interface SearchPostSummariesQueryService {
  searchPostSummaries(
    params: SearchPostSummariesParams
  ): Promise<SearchPostSummariesResult>;
}
