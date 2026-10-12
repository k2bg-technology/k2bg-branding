import type { ScatterQueryPlan } from '../../../domain';
import type { QueryOptions, ScatterPoints } from '../../shared';

export interface FetchScatterPointsQueryService {
  fetchScatterPoints(
    plan: ScatterQueryPlan,
    options: QueryOptions
  ): Promise<ScatterPoints | null>;
}
