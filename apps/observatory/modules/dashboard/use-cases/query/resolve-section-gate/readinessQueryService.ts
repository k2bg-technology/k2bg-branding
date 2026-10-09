import type { ReadinessQueryPlan } from '../../../domain';
import type { QueryOptions } from '../../shared';

export interface FetchSectionReadinessQueryService {
  fetchSectionReadiness(
    plan: ReadinessQueryPlan,
    options: QueryOptions
  ): Promise<boolean>;
}
