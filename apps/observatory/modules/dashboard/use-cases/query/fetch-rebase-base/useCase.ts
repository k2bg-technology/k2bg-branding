import {
  applyControlSelections,
  type ControlSelections,
  type DashboardDefinition,
  planPivotRebaseBase,
  planWideRebaseBase,
  type RebaseBase,
  rebaseBaseDate,
  SectionGrain,
  type TimeSeriesSection,
} from '../../../domain';
import type { FetchGroupedValuesQueryService } from '../fetch-bars-data/queryService';
import type { FetchSectionDataQueryService } from '../fetch-section-data/queryService';

export interface FetchRebaseBaseInput {
  dashboard: DashboardDefinition;
  section: TimeSeriesSection;
  selections: ControlSelections;
}

export class FetchRebaseBase {
  constructor(
    private readonly sectionDataQueryService: FetchSectionDataQueryService,
    private readonly groupedValuesQueryService: FetchGroupedValuesQueryService
  ) {}

  async execute({
    dashboard,
    section,
    selections,
  }: FetchRebaseBaseInput): Promise<RebaseBase | null> {
    const date = rebaseBaseDate(section);
    if (date === null)
      throw new Error('A fixed base date requires normalize.base.date');
    const grain = section.grain ?? dashboard.grain;
    if (grain === SectionGrain.HOUR)
      throw new Error('A fixed base date requires a date grain');
    const sourced = {
      ...section,
      source: applyControlSelections(dashboard, section, selections),
    };
    const options = {
      name: `dashboard-${dashboard.id}-section-${section.id}-rebase-base`,
      revalidate: dashboard.revalidate,
    };
    if (sourced.pivot === undefined) {
      const data = await this.sectionDataQueryService.fetchSectionData(
        planWideRebaseBase(sourced, grain, date, dashboard.timeZone),
        options
      );
      const bucket = data?.buckets[0];
      return bucket === undefined
        ? null
        : { layout: 'wide', values: bucket.values };
    }
    const data = await this.groupedValuesQueryService.fetchGroupedValues(
      planPivotRebaseBase(sourced, grain, date, dashboard.timeZone),
      options
    );
    if (data === null) return null;
    if (data.grouping !== 'period-category')
      throw new Error('A pivot base reads period and category keys');
    const bucket = data.buckets[0];
    return bucket === undefined ? null : { layout: 'pivot', bucket };
  }
}
