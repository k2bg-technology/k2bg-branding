import type { SortOrder } from '../../shared';

export interface SlugRecord {
  id: string;
  slug: string;
}

export interface FetchAllSlugsParams {
  orderBy: SortOrder;
}

/**
 * Query service interface for fetching all post slugs
 */
export interface FetchAllSlugsQueryService {
  fetchAllSlugs(params: FetchAllSlugsParams): Promise<SlugRecord[]>;
}
