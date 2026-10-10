import {
  applyControlSelections,
  type ControlSelections,
  type DashboardDefinition,
  type Period,
  planTableSection,
  type TableSection,
} from '../../../domain';
import type { TableRows } from '../../shared';
import type { FetchTableRowsQueryService } from './queryService';

export interface FetchTableRowsInput {
  dashboard: DashboardDefinition;
  section: TableSection;
  period: Period;
  page: number;
  selections: ControlSelections;
}

export class FetchTableRows {
  constructor(private readonly queryService: FetchTableRowsQueryService) {}

  execute({
    dashboard,
    section,
    period,
    page,
    selections,
  }: FetchTableRowsInput): Promise<TableRows | null> {
    return this.queryService.fetchTableRows(
      planTableSection(
        {
          ...section,
          source: applyControlSelections(dashboard, section, selections),
        },
        period,
        dashboard.timeZone,
        page
      ),
      {
        name: `dashboard-${dashboard.id}-section-${section.id}`,
        revalidate: dashboard.revalidate,
      }
    );
  }
}
