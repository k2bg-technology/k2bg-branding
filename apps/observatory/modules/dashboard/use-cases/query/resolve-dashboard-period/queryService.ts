import type { DateBounds, SourceDefinition } from '../../../domain';
import type { QueryOptions } from '../../shared';

export interface FetchPeriodBoundsQueryService {
  fetchPeriodBounds(
    source: SourceDefinition,
    timeZone: string,
    options: QueryOptions
  ): Promise<DateBounds | null>;
}
