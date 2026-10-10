import {
  type AggregatingSection,
  applyControlSelections,
  type ControlSelections,
  type DashboardDefinition,
  type Period,
  planSection,
} from '../../../domain';
import type { SectionData } from '../../shared';
import type { FetchSectionDataQueryService } from './queryService';

export interface FetchSectionDataInput {
  dashboard: DashboardDefinition;
  section: AggregatingSection;
  period: Period;
  selections: ControlSelections;
}

export class FetchSectionData {
  constructor(private readonly queryService: FetchSectionDataQueryService) {}

  execute({
    dashboard,
    section,
    period,
    selections,
  }: FetchSectionDataInput): Promise<SectionData | null> {
    return this.queryService.fetchSectionData(
      planSection(
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
