import type { PivotQueryPlan } from '../../../domain';
import type { PivotCells, QueryOptions } from '../../shared';

export interface FetchPivotDataQueryService {
  fetchPivotCells(
    plan: PivotQueryPlan,
    options: QueryOptions
  ): Promise<PivotCells | null>;
}
