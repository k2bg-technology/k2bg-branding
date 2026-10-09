import type { GroupedValuesPlan } from '../../../domain';
import type { GroupedValues, QueryOptions } from '../../shared';

export interface FetchGroupedValuesQueryService {
  fetchGroupedValues(
    plan: GroupedValuesPlan,
    options: QueryOptions
  ): Promise<GroupedValues | null>;
}
