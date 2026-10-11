import {
  applyControlSelections,
  type ControlSelections,
  type DashboardDefinition,
  type Period,
  type PivotTableSection,
  planPivotTableSection,
} from '../../../domain';
import type { PivotCells } from '../../shared';
import type { FetchPivotDataQueryService } from './queryService';

export interface FetchPivotDataInput {
  dashboard: DashboardDefinition;
  section: PivotTableSection;
  period: Period;
  selections: ControlSelections;
}

export class FetchPivotData {
  constructor(private readonly queryService: FetchPivotDataQueryService) {}

  execute({
    dashboard,
    section,
    period,
    selections,
  }: FetchPivotDataInput): Promise<PivotCells | null> {
    return this.queryService.fetchPivotCells(
      planPivotTableSection(
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
