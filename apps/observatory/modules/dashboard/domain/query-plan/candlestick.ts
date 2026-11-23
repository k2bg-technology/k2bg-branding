import { type CandlestickSection, Reduction } from '../definition';
import { type Period, resolveSectionRange } from '../period';
import { MAXIMUM_SECTION_BUCKETS } from './timeSeries';
import type { SectionQueryPlan } from './types';

export function planCandlestickSection(
  section: CandlestickSection,
  period: Period,
  timeZone: string
): Extract<SectionQueryPlan, { kind: 'candlestick' }> {
  const { dateRange } = resolveSectionRange(section, period);
  return {
    kind: section.kind,
    sectionId: section.id,
    source: section.source,
    timeZone,
    selectedPeriod: period.toString(),
    dateRange,
    grain: section.grain ?? period.grain,
    measures: [
      { column: section.open.column, reduction: 'earliest' },
      { column: section.high.column, reduction: Reduction.MAXIMUM },
      { column: section.low.column, reduction: Reduction.MINIMUM },
      { column: section.close.column, reduction: Reduction.LATEST },
    ],
    bucketLimit: MAXIMUM_SECTION_BUCKETS,
  };
}
