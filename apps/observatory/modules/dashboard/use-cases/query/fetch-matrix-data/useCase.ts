import {
  applyControlSelections,
  type ControlSelections,
  type DashboardDefinition,
  type MatrixHeatmapSection,
  type Period,
  planMatrixHeatmapSection,
} from '../../../domain';
import type { MatrixData } from '../../shared';
import type { FetchMatrixDataQueryService } from './queryService';

export interface FetchMatrixDataInput {
  dashboard: DashboardDefinition;
  section: MatrixHeatmapSection;
  period: Period;
  selections: ControlSelections;
}

export class FetchMatrixData {
  constructor(private readonly queryService: FetchMatrixDataQueryService) {}

  async execute({
    dashboard,
    section,
    period,
    selections,
  }: FetchMatrixDataInput): Promise<MatrixData | null> {
    const plan = planMatrixHeatmapSection(
      {
        ...section,
        source: applyControlSelections(dashboard, section, selections),
      },
      period,
      dashboard.timeZone
    );
    if (
      plan.rows.axis !== 'category' &&
      plan.columns.axis !== 'category' &&
      plan.rows.length * plan.columns.length > plan.cellLimit
    ) {
      return { status: 'too-large' };
    }
    return this.queryService.fetchMatrixData(plan, {
      name: `dashboard-${dashboard.id}-section-${section.id}`,
      revalidate: dashboard.revalidate,
    });
  }
}
