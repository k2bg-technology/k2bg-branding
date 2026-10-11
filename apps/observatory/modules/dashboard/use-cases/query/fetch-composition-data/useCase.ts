import {
  applyControlSelections,
  type CompositionSection,
  type ControlSelections,
  type DashboardDefinition,
  type Period,
  planDonutCenter,
  planDonutParts,
  planTreemapParts,
  SectionKind,
} from '../../../domain';
import type { CompositionData } from '../../shared';
import type { FetchGroupedValuesQueryService } from '../fetch-bars-data/queryService';
import type { FetchSectionDataQueryService } from '../fetch-section-data/queryService';
import type { FetchTreemapPartsQueryService } from './queryService';

export interface FetchCompositionDataInput {
  dashboard: DashboardDefinition;
  section: CompositionSection;
  period: Period;
  selections: ControlSelections;
}

export class FetchCompositionData {
  constructor(
    private readonly groupedValuesQueryService: FetchGroupedValuesQueryService,
    private readonly treemapPartsQueryService: FetchTreemapPartsQueryService,
    private readonly sectionDataQueryService: FetchSectionDataQueryService
  ) {}

  async execute({
    dashboard,
    section,
    period,
    selections,
  }: FetchCompositionDataInput): Promise<CompositionData | null> {
    const source = applyControlSelections(dashboard, section, selections);
    const options = {
      name: `dashboard-${dashboard.id}-section-${section.id}`,
      revalidate: dashboard.revalidate,
    };
    if (section.kind === SectionKind.TREEMAP) {
      const parts = await this.treemapPartsQueryService.fetchTreemapParts(
        planTreemapParts({ ...section, source }, period, dashboard.timeZone),
        options
      );
      return parts === null ? null : { parts, center: null };
    }
    const sourced = { ...section, source };
    const centerPlan = planDonutCenter(sourced, period, dashboard.timeZone);
    const [values, centerData] = await Promise.all([
      this.groupedValuesQueryService.fetchGroupedValues(
        planDonutParts(sourced, period, dashboard.timeZone),
        options
      ),
      centerPlan === null
        ? null
        : this.sectionDataQueryService.fetchSectionData(centerPlan, {
            ...options,
            name: `${options.name}-center`,
          }),
    ]);
    if (values === null) return null;
    if (values.grouping !== 'category') {
      throw new Error('A donut reads category groups');
    }
    return {
      parts: values.groups.map((group) => ({
        category: group.category,
        value: group.values[0] ?? null,
        sortKey: group.sortKey,
      })),
      center:
        centerData?.buckets.find(
          (bucket) => bucket.period === period.toString()
        )?.values[0] ?? null,
    };
  }
}
