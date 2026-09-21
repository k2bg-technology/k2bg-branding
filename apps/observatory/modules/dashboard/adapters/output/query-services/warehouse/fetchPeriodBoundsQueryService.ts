import type {
  WarehouseClient,
  WarehouseRow,
} from '../../../../../../infrastructure/warehouse';
import type { DateBounds, SourceDefinition } from '../../../../domain';
import type {
  FetchPeriodBoundsQueryService,
  QueryOptions,
} from '../../../../use-cases';
import { RepositoryError } from '../../../shared';
import { toDateBounds } from './mapper';
import { buildPeriodBoundsQuery } from './query';

export class WarehouseFetchPeriodBoundsQueryService
  implements FetchPeriodBoundsQueryService
{
  constructor(private readonly client: WarehouseClient) {}

  async fetchPeriodBounds(
    source: SourceDefinition,
    timeZone: string,
    options: QueryOptions
  ): Promise<DateBounds | null> {
    const rows = await this.fetchRows(source, timeZone, options);
    return toDateBounds(rows);
  }

  private async fetchRows(
    source: SourceDefinition,
    timeZone: string,
    options: QueryOptions
  ): Promise<WarehouseRow[]> {
    const query = buildPeriodBoundsQuery(source, timeZone);
    try {
      return await this.client.query({
        name: options.name,
        ...query,
        revalidate: options.revalidate,
      });
    } catch (error) {
      throw new RepositoryError(
        'Failed to fetch dashboard period bounds',
        error
      );
    }
  }
}
