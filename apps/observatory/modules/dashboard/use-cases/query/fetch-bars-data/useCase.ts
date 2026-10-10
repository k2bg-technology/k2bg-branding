import {
  applyControlSelections,
  type BarsSection,
  type ControlSelections,
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
  selections: ControlSelections;
}

export class FetchBarsData {
  constructor(private readonly queryService: FetchGroupedValuesQueryService) {}

  execute({
    dashboard,
    section,
    period,
    selections,
  }: FetchBarsDataInput): Promise<GroupedValues | null> {
    return this.queryService.fetchGroupedValues(
      planBarsSection(
        {
          ...section,
          source: applyControlSelections(dashboard, section, selections),
        },
        period,
        dashboard.timeZone
      ),
      {
        name: `dashboard-${dashboard.id}-section-${section.id}`,
        revalidate: dashboard.revalidate,
      }
    );
  }
}
