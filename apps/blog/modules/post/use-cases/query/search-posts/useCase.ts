import {
  InvalidPaginationError,
  InvalidSearchQueryError,
  type PaginatedResult,
  type PostOutput,
  type SortOrder,
  toPostOutput,
} from '../../shared';
import type { SearchPostsQueryService } from './queryService';

export interface SearchPostsInput {
  query: string;
  page?: number;
  pageSize?: number;
  orderBy?: SortOrder;
}

export type SearchPostsOutput = PaginatedResult<PostOutput>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_ORDER: SortOrder = 'desc';
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;

/**
 * SearchPosts Use Case
 *
 * Searches posts by query string with pagination.
 */
export class SearchPosts {
  constructor(private readonly queryService: SearchPostsQueryService) {}

  async execute(input: SearchPostsInput): Promise<SearchPostsOutput> {
    const { query } = input;
    const page = input.page ?? DEFAULT_PAGE;
    const pageSize = input.pageSize ?? DEFAULT_PAGE_SIZE;
    const orderBy = input.orderBy ?? DEFAULT_ORDER;

    this.validateQuery(query);
    this.validatePagination(page, pageSize);

    const { posts, totalCount } = await this.queryService.searchPosts({
      query: query.trim(),
      page,
      pageSize,
      orderBy,
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      items: posts.map(toPostOutput),
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
