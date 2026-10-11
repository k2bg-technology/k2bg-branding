import type { WarehouseClient } from '../../../../../../infrastructure/warehouse';
import type { MatrixQueryPlan } from '../../../../domain';
import type {
  FetchMatrixDataQueryService,
  MatrixData,
  QueryOptions,
} from '../../../../use-cases';
import { RepositoryError } from '../../../shared';
import { toMatrixData } from './mapper';
import { buildMatrixQuery } from './matrixHeatmap';

export class WarehouseFetchMatrixDataQueryService
  implements FetchMatrixDataQueryService
{
  constructor(private readonly client: WarehouseClient) {}

  async fetchMatrixData(
    plan: MatrixQueryPlan,
    options: QueryOptions
  ): Promise<MatrixData | null> {
    const rows = await this.fetchRows(plan, options);
    return toMatrixData(rows, plan);
  }

  private async fetchRows(plan: MatrixQueryPlan, options: QueryOptions) {
    const query = buildMatrixQuery(plan);
    try {
      return await this.client.query({
        name: options.name,
        ...query,
        revalidate: options.revalidate,
      });
    } catch (error) {
      throw new RepositoryError('Failed to fetch dashboard matrix data', error);
    }
  }
}
