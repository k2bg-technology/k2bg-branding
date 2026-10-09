import {
  type BarsSection,
  type DashboardDefinition,
  type Period,
  planBarsSection,
} from '../../../domain';
import type { GroupedValues } from '../../shared';
import type { FetchGroupedValuesQueryService } from './queryService';

export interface FetchBarsDataInput {
  dashboard: DashboardDefinition;
  section: BarsSection;
  period: Period;
}

export class FetchBarsData {
  constructor(private readonly queryService: FetchGroupedValuesQueryService) {}

  execute({
    dashboard,
    section,
    period,
  }: FetchBarsDataInput): Promise<GroupedValues | null> {
    return this.queryService.fetchGroupedValues(
      planBarsSection(section, period, dashboard.timeZone),
      {
        name: `dashboard-${dashboard.id}-section-${section.id}`,
        revalidate: dashboard.revalidate,
      }
    );
  }
}
