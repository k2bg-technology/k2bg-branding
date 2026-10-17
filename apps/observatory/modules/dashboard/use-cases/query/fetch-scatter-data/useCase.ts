import {
  applyControlSelections,
  type ControlSelections,
  type DashboardDefinition,
  type Period,
  planScatterPoints,
  planScatterTrend,
  type ScatterSection,
} from '../../../domain';
import type { ScatterData } from '../../shared';
import type { FetchSectionDataQueryService } from '../fetch-section-data/queryService';
import type { FetchScatterPointsQueryService } from './queryService';

export interface FetchScatterDataInput {
  dashboard: DashboardDefinition;
  section: ScatterSection;
  period: Period;
  selections: ControlSelections;
}

export class FetchScatterData {
  constructor(
    private readonly scatterPointsQueryService: FetchScatterPointsQueryService,
    private readonly sectionDataQueryService: FetchSectionDataQueryService
  ) {}

  async execute({
    dashboard,
    section,
    period,
    selections,
  }: FetchScatterDataInput): Promise<ScatterData | null> {
    const sourced = {
      ...section,
      source: applyControlSelections(dashboard, section, selections),
    };
    const options = {
      name: `dashboard-${dashboard.id}-section-${section.id}`,
      revalidate: dashboard.revalidate,
    };
    const trendPlan = planScatterTrend(sourced, period, dashboard.timeZone);
    const [points, trendData] = await Promise.all([
      this.scatterPointsQueryService.fetchScatterPoints(
        planScatterPoints(sourced, period, dashboard.timeZone),
        options
      ),
      trendPlan === null
        ? null
        : this.sectionDataQueryService.fetchSectionData(trendPlan, {
            ...options,
            name: `${options.name}-trend`,
          }),
    ]);
    if (points === null) return null;
    const coefficients = trendData?.buckets.find(
      (bucket) => bucket.period === period.toString()
    )?.values;
    const slope = coefficients?.[0] ?? null;
    const intercept = coefficients?.[1] ?? null;
    return {
      ...points,
      trendLine:
        slope === null || intercept === null ? null : { slope, intercept },
    };
  }
}
