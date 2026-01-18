import type { SlugOutput, SortOrder } from '../../shared';
import type { FetchAllSlugsQueryService } from './queryService';

export interface FetchAllSlugsInput {
  orderBy?: SortOrder;
}

export interface FetchAllSlugsOutput {
  slugs: SlugOutput[];
}

const DEFAULT_ORDER: SortOrder = 'desc';

/**
 * FetchAllSlugs Use Case
 *
 * Fetches all post slugs.
 */
export class FetchAllSlugs {
  constructor(private readonly queryService: FetchAllSlugsQueryService) {}

  async execute(input: FetchAllSlugsInput = {}): Promise<FetchAllSlugsOutput> {
    const orderBy = input.orderBy ?? DEFAULT_ORDER;

    const slugRecords = await this.queryService.fetchAllSlugs({ orderBy });

    return {
      slugs: slugRecords.map((record) => ({
        id: record.id,
        slug: record.slug,
      })),
    };
  }
}
