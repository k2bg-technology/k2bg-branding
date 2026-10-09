import type { BarsSection } from '../definition';
import type { Period } from '../period';
import type { GroupedValuesPlan } from './groupedValues';
import { MAXIMUM_SECTION_BUCKETS } from './timeSeries';

export function planBarsSection(
  section: BarsSection,
  period: Period,
  timeZone: string
): GroupedValuesPlan {
  const measures =
    section.pivot !== undefined
      ? [section.pivot.value]
      : section.series?.map(({ column, reduction, transform }) => ({
          column,
          reduction,
          transform,
        }));
  if (measures === undefined) {
    throw new Error('A bars section requires series or pivot');
  }
  const category: GroupedValuesPlan['category'] =
    section.x.axis === 'category'
      ? {
          column: section.x.column,
          sortKey:
            section.x.order === 'value-desc' ? null : section.x.order.sortKey,
        }
      : null;
  const pivotCategory: GroupedValuesPlan['category'] =
    section.pivot === undefined
      ? null
      : { column: section.pivot.column, sortKey: null };
  return {
    sectionId: section.id,
    source: section.source,
    timeZone,
    dateRange: {
      firstDate:
        section.x.axis === 'time'
          ? period.shift(-(section.x.window - 1)).firstDate
          : period.firstDate,
      lastDate: period.lastDate,
    },
    measures,
    buckets:
      section.x.axis === 'time'
        ? { grain: period.grain, bucketLimit: MAXIMUM_SECTION_BUCKETS }
        : null,
    category: category ?? pivotCategory,
  };
}
