import type {
  WarehouseClient,
  WarehouseRow,
} from '../../../../../../infrastructure/warehouse';
import type { ScatterQueryPlan } from '../../../../domain';
import type {
  FetchScatterPointsQueryService,
  QueryOptions,
  ScatterPoints,
} from '../../../../use-cases';
import { RepositoryError } from '../../../shared';
import { toScatterPoints } from './mapper';
import { buildScatterQuery } from './scatter';

export class WarehouseFetchScatterPointsQueryService
  implements FetchScatterPointsQueryService
{
  constructor(private readonly client: WarehouseClient) {}

  async fetchScatterPoints(
    plan: ScatterQueryPlan,
    options: QueryOptions
  ): Promise<ScatterPoints | null> {
    const rows = await this.fetchRows(plan, options);
    return toScatterPoints(rows, plan);
  }

  private async fetchRows(
    plan: ScatterQueryPlan,
    options: QueryOptions
  ): Promise<WarehouseRow[]> {
    const query = buildScatterQuery(plan);
    try {
      return await this.client.query({
        name: options.name,
        ...query,
        revalidate: options.revalidate,
      });
    } catch (error) {
      throw new RepositoryError(
        'Failed to fetch dashboard scatter points',
        error
      );
    }
  }
}
