import {
  InvalidPaginationError,
  InvalidSearchQueryError,
  type PaginatedResult,
  type PostSummaryOutput,
  type SortOrder,
} from '../../shared';
import type { SearchPostSummariesQueryService } from './queryService';

export interface SearchPostSummariesInput {
  query: string;
  page?: number;
  pageSize?: number;
  orderBy?: SortOrder;
}

export type SearchPostSummariesOutput = PaginatedResult<PostSummaryOutput>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_ORDER: SortOrder = 'desc';
const MIN_QUERY_LENGTH = 0;
const MAX_QUERY_LENGTH = 100;

/**
 * SearchPostSummaries Use Case
 *
 * Searches post summaries by query string with pagination.
 */
export class SearchPostSummaries {
  constructor(private readonly queryService: SearchPostSummariesQueryService) {}

  async execute(
    input: SearchPostSummariesInput
  ): Promise<SearchPostSummariesOutput> {
    const { query } = input;
    const page = input.page ?? DEFAULT_PAGE;
    const pageSize = input.pageSize ?? DEFAULT_PAGE_SIZE;
    const orderBy = input.orderBy ?? DEFAULT_ORDER;

    this.validateQuery(query);
    this.validatePagination(page, pageSize);

    const { posts, totalCount } = await this.queryService.searchPostSummaries({
      query: query.trim(),
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

  private validateQuery(query: string): void {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      throw new InvalidSearchQueryError(
        `query must be at least ${MIN_QUERY_LENGTH} characters`
      );
    }
    if (trimmedQuery.length > MAX_QUERY_LENGTH) {
      throw new InvalidSearchQueryError(
        `query must not exceed ${MAX_QUERY_LENGTH} characters`
      );
    }
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
