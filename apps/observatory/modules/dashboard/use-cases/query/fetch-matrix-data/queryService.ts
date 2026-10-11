import type { MatrixQueryPlan } from '../../../domain';
import type { MatrixData, QueryOptions } from '../../shared';

export interface FetchMatrixDataQueryService {
  fetchMatrixData(
    plan: MatrixQueryPlan,
    options: QueryOptions
  ): Promise<MatrixData | null>;
}
