import type {
  WarehouseClient,
  WarehouseRow,
} from '../../../../../../infrastructure/warehouse';
import type { SectionQueryPlan } from '../../../../domain';
import type {
  FetchSectionDataQueryService,
  QueryOptions,
  SectionData,
} from '../../../../use-cases';
import { RepositoryError } from '../../../shared';
import { buildSectionQuery } from './buildSectionQuery';
import { toSectionData } from './mapper';

export class WarehouseFetchSectionDataQueryService
  implements FetchSectionDataQueryService
{
  constructor(private readonly client: WarehouseClient) {}

  async fetchSectionData(
    plan: SectionQueryPlan,
    options: QueryOptions
  ): Promise<SectionData | null> {
    const rows = await this.fetchRows(plan, options);
    return toSectionData(rows, plan);
  }

  private async fetchRows(
    plan: SectionQueryPlan,
    options: QueryOptions
  ): Promise<WarehouseRow[]> {
    const query = buildSectionQuery(plan);
    try {
      return await this.client.query({
        name: options.name,
        ...query,
        revalidate: options.revalidate,
      });
    } catch (error) {
      throw new RepositoryError(
        'Failed to fetch dashboard section data',
        error
      );
    }
  }
}
