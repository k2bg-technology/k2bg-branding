import type { SectionQueryPlan } from '../../../domain';
import type { QueryOptions, SectionData } from '../../shared';

export interface FetchSectionDataQueryService {
  fetchSectionData(
    plan: SectionQueryPlan,
    options: QueryOptions
  ): Promise<SectionData | null>;
}
