import type {
  WarehouseClient,
  WarehouseRow,
} from '../../../../../../infrastructure/warehouse';
import type { GroupedValuesPlan } from '../../../../domain';
import type {
  FetchGroupedValuesQueryService,
  GroupedValues,
  QueryOptions,
} from '../../../../use-cases';
import { RepositoryError } from '../../../shared';
import { buildGroupedValuesQuery } from './groupedValues';
import { toGroupedValues } from './mapper';

export class WarehouseFetchGroupedValuesQueryService
  implements FetchGroupedValuesQueryService
{
  constructor(private readonly client: WarehouseClient) {}

  async fetchGroupedValues(
    plan: GroupedValuesPlan,
    options: QueryOptions
  ): Promise<GroupedValues | null> {
    const rows = await this.fetchRows(plan, options);
    return toGroupedValues(rows, plan);
  }

  private async fetchRows(
    plan: GroupedValuesPlan,
    options: QueryOptions
  ): Promise<WarehouseRow[]> {
    const query = buildGroupedValuesQuery(plan);
    try {
      return await this.client.query({
        name: options.name,
        ...query,
        revalidate: options.revalidate,
      });
    } catch (error) {
      throw new RepositoryError(
        'Failed to fetch dashboard grouped values',
        error
      );
    }
  }
}
