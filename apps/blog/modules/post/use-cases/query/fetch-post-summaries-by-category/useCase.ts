import type { Category } from '../../../domain';
import {
  InvalidPaginationError,
  type PaginatedResult,
  type PostSummaryOutput,
  type SortOrder,
} from '../../shared';
import type { FetchPostSummariesByCategoryQueryService } from './queryService';

export interface FetchPostSummariesByCategoryInput {
  category: Category;
  page?: number;
  pageSize?: number;
  orderBy?: SortOrder;
}

export type FetchPostSummariesByCategoryOutput =
  PaginatedResult<PostSummaryOutput>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_ORDER: SortOrder = 'desc';

/**
 * FetchPostSummariesByCategory Use Case
 *
 * Fetches paginated list of post summaries filtered by category.
 */
export class FetchPostSummariesByCategory {
  constructor(
    private readonly queryService: FetchPostSummariesByCategoryQueryService
  ) {}

  async execute(
    input: FetchPostSummariesByCategoryInput
  ): Promise<FetchPostSummariesByCategoryOutput> {
    const { category } = input;
    const page = input.page ?? DEFAULT_PAGE;
    const pageSize = input.pageSize ?? DEFAULT_PAGE_SIZE;
    const orderBy = input.orderBy ?? DEFAULT_ORDER;

    this.validatePagination(page, pageSize);

    const { posts, totalCount } =
      await this.queryService.fetchPostSummariesByCategory({
        category,
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
