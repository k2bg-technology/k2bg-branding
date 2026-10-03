import type { TimeSeriesSection } from '../definition';
import type { Period } from '../period';
import type { SectionQueryPlan } from './types';

export const MAXIMUM_SECTION_BUCKETS = 120;

export function planTimeSeriesSection(
  section: TimeSeriesSection,
  period: Period,
  timeZone: string
): Extract<SectionQueryPlan, { kind: 'time-series' }> {
  return {
    kind: section.kind,
    sectionId: section.id,
    source: section.source,
    timeZone,
    selectedPeriod: period.toString(),
    dateRange: {
      firstDate: period.shift(-(section.window - 1)).firstDate,
      lastDate: period.lastDate,
    },
    measures: section.series.map((series) => ({
      column: series.column,
      reduction: series.reduction,
      transform: series.transform,
    })),
    bucketLimit: MAXIMUM_SECTION_BUCKETS,
  };
}
