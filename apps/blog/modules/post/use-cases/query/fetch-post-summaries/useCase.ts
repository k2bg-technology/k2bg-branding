import {
  InvalidPaginationError,
  type PaginatedResult,
  type PostSummaryOutput,
  type SortOrder,
} from '../../shared';
import type { FetchPostSummariesQueryService } from './queryService';

export interface FetchPostSummariesInput {
  page?: number;
  pageSize?: number;
  orderBy?: SortOrder;
}

export type FetchPostSummariesOutput = PaginatedResult<PostSummaryOutput>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_ORDER: SortOrder = 'desc';

/**
 * FetchPostSummaries Use Case
 *
 * Fetches paginated list of post summaries (excludes content).
 */
export class FetchPostSummaries {
  constructor(private readonly queryService: FetchPostSummariesQueryService) {}

  async execute(
    input: FetchPostSummariesInput = {}
  ): Promise<FetchPostSummariesOutput> {
    const page = input.page ?? DEFAULT_PAGE;
    const pageSize = input.pageSize ?? DEFAULT_PAGE_SIZE;
    const orderBy = input.orderBy ?? DEFAULT_ORDER;

    this.validatePagination(page, pageSize);

    const { posts, totalCount } = await this.queryService.fetchPostSummaries({
      page,
      pageSize,
      orderBy,
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      items: posts,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  private validatePagination(page: number, pageSize: number): void {
    if (page < 1) {
      throw new InvalidPaginationError('page must be at least 1');
    }
    if (pageSize < 1) {
      throw new InvalidPaginationError('pageSize must be at least 1');
    }
    if (pageSize > 100) {
      throw new InvalidPaginationError('pageSize must not exceed 100');
    }
  }
}
