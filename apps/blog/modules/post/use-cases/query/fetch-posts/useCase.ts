import {
  InvalidPaginationError,
  type PaginatedResult,
  type PostOutput,
  type SortOrder,
  toPostOutput,
} from '../../shared';
import type { FetchPostsQueryService } from './queryService';

export interface FetchPostsInput {
  page?: number;
  pageSize?: number;
  orderBy?: SortOrder;
}

export type FetchPostsOutput = PaginatedResult<PostOutput>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_ORDER: SortOrder = 'desc';

/**
 * FetchPosts Use Case
 *
 * Fetches paginated list of posts with sorting.
 */
export class FetchPosts {
  constructor(private readonly queryService: FetchPostsQueryService) {}

  async execute(input: FetchPostsInput = {}): Promise<FetchPostsOutput> {
    const page = input.page ?? DEFAULT_PAGE;
    const pageSize = input.pageSize ?? DEFAULT_PAGE_SIZE;
    const orderBy = input.orderBy ?? DEFAULT_ORDER;

    this.validatePagination(page, pageSize);

    const { posts, totalCount } = await this.queryService.fetchPosts({
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
