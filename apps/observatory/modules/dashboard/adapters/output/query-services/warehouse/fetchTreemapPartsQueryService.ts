import type {
  WarehouseClient,
  WarehouseRow,
} from '../../../../../../infrastructure/warehouse';
import type { TreemapQueryPlan } from '../../../../domain';
import type {
  CompositionPart,
  FetchTreemapPartsQueryService,
  QueryOptions,
} from '../../../../use-cases';
import { RepositoryError } from '../../../shared';
import { toTreemapParts } from './mapper';
import { buildTreemapQuery } from './treemap';

export class WarehouseFetchTreemapPartsQueryService
  implements FetchTreemapPartsQueryService
{
  constructor(private readonly client: WarehouseClient) {}

  async fetchTreemapParts(
    plan: TreemapQueryPlan,
    options: QueryOptions
  ): Promise<CompositionPart[] | null> {
    const rows = await this.fetchRows(plan, options);
    return toTreemapParts(rows, plan);
  }

  private async fetchRows(
    plan: TreemapQueryPlan,
    options: QueryOptions
  ): Promise<WarehouseRow[]> {
    const query = buildTreemapQuery(plan);
    try {
      return await this.client.query({
        name: options.name,
        ...query,
        revalidate: options.revalidate,
      });
    } catch (error) {
      throw new RepositoryError(
        'Failed to fetch dashboard treemap parts',
        error
      );
    }
  }
}
