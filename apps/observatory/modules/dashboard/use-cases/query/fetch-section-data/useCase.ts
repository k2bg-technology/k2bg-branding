import {
  type DashboardDefinition,
  type Period,
  planSection,
  type Section,
} from '../../../domain';
import type { SectionData } from '../../shared';
import type { FetchSectionDataQueryService } from './queryService';

export interface FetchSectionDataInput {
  dashboard: DashboardDefinition;
  section: Section;
  period: Period;
}

export class FetchSectionData {
  constructor(private readonly queryService: FetchSectionDataQueryService) {}

  execute({
    dashboard,
    section,
    period,
  }: FetchSectionDataInput): Promise<SectionData | null> {
    return this.queryService.fetchSectionData(
      planSection(section, period, dashboard.timeZone),
      {
        name: `dashboard-${dashboard.id}-section-${section.id}`,
        revalidate: dashboard.revalidate,
      }
    );
  }
}
