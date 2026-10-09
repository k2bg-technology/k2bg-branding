import type {
  WarehouseClient,
  WarehouseRow,
} from '../../../../../../infrastructure/warehouse';
import type { ReadinessQueryPlan } from '../../../../domain';
import type {
  FetchSectionReadinessQueryService,
  QueryOptions,
} from '../../../../use-cases';
import { RepositoryError } from '../../../shared';
import { toSectionReadiness } from './mapper';
import { buildReadinessQuery } from './readiness';

export class WarehouseFetchSectionReadinessQueryService
  implements FetchSectionReadinessQueryService
{
  constructor(private readonly client: WarehouseClient) {}

  async fetchSectionReadiness(
    plan: ReadinessQueryPlan,
    options: QueryOptions
  ): Promise<boolean> {
    const rows = await this.fetchRows(plan, options);
    return toSectionReadiness(rows);
  }

  private async fetchRows(
    plan: ReadinessQueryPlan,
    options: QueryOptions
  ): Promise<WarehouseRow[]> {
    const query = buildReadinessQuery(plan);
    try {
      return await this.client.query({
        name: options.name,
        ...query,
        revalidate: options.revalidate,
      });
    } catch (error) {
      throw new RepositoryError(
        'Failed to fetch dashboard section readiness',
        error
      );
    }
  }
}
