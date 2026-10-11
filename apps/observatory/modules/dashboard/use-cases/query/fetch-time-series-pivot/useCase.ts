import {
  applyControlSelections,
  type ControlSelections,
  type DashboardDefinition,
  type Period,
  planTimeSeriesPivot,
  type TimeSeriesSection,
} from '../../../domain';
import type { GroupedValues } from '../../shared';
import type { FetchGroupedValuesQueryService } from '../fetch-bars-data/queryService';

export interface FetchTimeSeriesPivotInput {
  dashboard: DashboardDefinition;
  section: TimeSeriesSection;
  period: Period;
  selections: ControlSelections;
}

export type PivotBuckets = Extract<
  GroupedValues,
  { grouping: 'period-category' }
>;

export class FetchTimeSeriesPivot {
  constructor(private readonly queryService: FetchGroupedValuesQueryService) {}

  async execute({
    dashboard,
    section,
    period,
    selections,
  }: FetchTimeSeriesPivotInput): Promise<PivotBuckets | null> {
    const data = await this.queryService.fetchGroupedValues(
      planTimeSeriesPivot(
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
    if (data !== null && data.grouping !== 'period-category') {
      throw new Error('A time-series pivot reads period and category keys');
    }
    return data;
  }
}
