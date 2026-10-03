import type { SortOrder } from '../../shared';

export interface SlugRecord {
  id: string;
  slug: string;
  revisionDate: string;
}

export interface FetchAllSlugsParams {
  orderBy: SortOrder;
}

export interface FetchAllSlugsQueryService {
  fetchAllSlugs(params: FetchAllSlugsParams): Promise<SlugRecord[]>;
}
