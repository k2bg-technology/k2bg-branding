import type {
  WarehouseClient,
  WarehouseRow,
} from '../../../../../../infrastructure/warehouse';
import type { PivotQueryPlan } from '../../../../domain';
import type {
  FetchPivotDataQueryService,
  PivotCells,
  QueryOptions,
} from '../../../../use-cases';
import { RepositoryError } from '../../../shared';
import { toPivotCells } from './mapper';
import { buildPivotQuery } from './pivotTable';

export class WarehouseFetchPivotDataQueryService
  implements FetchPivotDataQueryService
{
  constructor(private readonly client: WarehouseClient) {}

  async fetchPivotCells(
    plan: PivotQueryPlan,
    options: QueryOptions
  ): Promise<PivotCells | null> {
    const rows = await this.fetchRows(plan, options);
    return toPivotCells(rows, plan);
  }

  private async fetchRows(
    plan: PivotQueryPlan,
    options: QueryOptions
  ): Promise<WarehouseRow[]> {
    const query = buildPivotQuery(plan);
    try {
      return await this.client.query({
        name: options.name,
        ...query,
        revalidate: options.revalidate,
      });
    } catch (error) {
      throw new RepositoryError('Failed to fetch dashboard pivot cells', error);
    }
  }
}
