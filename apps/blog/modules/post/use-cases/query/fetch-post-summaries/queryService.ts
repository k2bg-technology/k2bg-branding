import type { PostStatus } from '../../../domain';
import type { PostSummaryOutput, SortOrder } from '../../shared';

export interface FetchPostSummariesParams {
  page: number;
  pageSize: number;
  orderBy: SortOrder;
  status?: PostStatus;
}

export interface FetchPostSummariesResult {
  posts: PostSummaryOutput[];
  totalCount: number;
}

export interface FetchPostSummariesQueryService {
  fetchPostSummaries(
    params: FetchPostSummariesParams
  ): Promise<FetchPostSummariesResult>;
}
