import {
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
}

export class FetchTableRows {
  constructor(private readonly queryService: FetchTableRowsQueryService) {}

  execute({
    dashboard,
    section,
    period,
    page,
  }: FetchTableRowsInput): Promise<TableRows | null> {
    return this.queryService.fetchTableRows(
      planTableSection(section, period, dashboard.timeZone, page),
      {
        name: `dashboard-${dashboard.id}-section-${section.id}`,
        revalidate: dashboard.revalidate,
      }
    );
  }
}
