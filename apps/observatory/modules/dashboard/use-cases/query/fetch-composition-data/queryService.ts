import type { TreemapQueryPlan } from '../../../domain';
import type { CompositionPart, QueryOptions } from '../../shared';

export interface FetchTreemapPartsQueryService {
  fetchTreemapParts(
    plan: TreemapQueryPlan,
    options: QueryOptions
  ): Promise<CompositionPart[] | null>;
}
