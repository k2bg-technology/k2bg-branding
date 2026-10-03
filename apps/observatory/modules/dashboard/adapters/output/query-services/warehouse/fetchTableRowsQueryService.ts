import type {
  WarehouseClient,
  WarehouseRow,
} from '../../../../../../infrastructure/warehouse';
import type { TableQueryPlan } from '../../../../domain';
import type {
  FetchTableRowsQueryService,
  QueryOptions,
  TableRows,
} from '../../../../use-cases';
import { RepositoryError } from '../../../shared';
import { toTableRows } from './mapper';
import { buildTableQuery } from './table';

export class WarehouseFetchTableRowsQueryService
  implements FetchTableRowsQueryService
{
  constructor(private readonly client: WarehouseClient) {}

  async fetchTableRows(
    plan: TableQueryPlan,
    options: QueryOptions
  ): Promise<TableRows | null> {
    const rows = await this.fetchRows(plan, options);
    return toTableRows(rows, plan);
  }

  private async fetchRows(
    plan: TableQueryPlan,
    options: QueryOptions
  ): Promise<WarehouseRow[]> {
    const query = buildTableQuery(plan);
    try {
      return await this.client.query({
        name: options.name,
        ...query,
        revalidate: options.revalidate,
      });
    } catch (error) {
      throw new RepositoryError('Failed to fetch dashboard table rows', error);
    }
  }
}
