import type { TimeSeriesSection } from '../definition';
import { type Period, resolveSectionRange } from '../period';
import type { SectionQueryPlan } from './types';

export const MAXIMUM_SECTION_BUCKETS = 120;

export function planTimeSeriesSection(
  section: TimeSeriesSection,
  period: Period,
  timeZone: string
): Extract<SectionQueryPlan, { kind: 'time-series' }> {
  const range = resolveSectionRange(section, period);
  const common = {
    kind: section.kind,
    sectionId: section.id,
    source: section.source,
    timeZone,
    selectedPeriod: period.toString(),
    dateRange: range.dateRange,
    measures: section.series.map((series) => ({
      column: series.column,
      reduction: series.reduction,
      transform: series.transform,
    })),
    bucketLimit: MAXIMUM_SECTION_BUCKETS,
  };
  return range.grain === 'hour'
    ? { ...common, grain: range.grain, firstHour: range.firstHour }
    : { ...common, grain: range.grain };
}
