import type { Category } from '../../../domain';
import {
  InvalidPaginationError,
  type PaginatedResult,
  type PostOutput,
  type SortOrder,
  toPostOutput,
} from '../../shared';
import type { FetchPostsByCategoryQueryService } from './queryService';

export interface FetchPostsByCategoryInput {
  category: Category;
  page?: number;
  pageSize?: number;
  orderBy?: SortOrder;
}

export type FetchPostsByCategoryOutput = PaginatedResult<PostOutput>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_ORDER: SortOrder = 'desc';

/**
 * FetchPostsByCategory Use Case
 *
 * Fetches paginated list of posts filtered by category.
 */
export class FetchPostsByCategory {
  constructor(
    private readonly queryService: FetchPostsByCategoryQueryService
  ) {}

  async execute(
    input: FetchPostsByCategoryInput
  ): Promise<FetchPostsByCategoryOutput> {
    const { category } = input;
    const page = input.page ?? DEFAULT_PAGE;
    const pageSize = input.pageSize ?? DEFAULT_PAGE_SIZE;
    const orderBy = input.orderBy ?? DEFAULT_ORDER;

    this.validatePagination(page, pageSize);

    const { posts, totalCount } = await this.queryService.fetchPostsByCategory({
      category,
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
