import {
  type DonutSection,
  Reduction,
  SectionKind,
  type SourceDefinition,
  type TreemapSection,
  type ValueTransform,
} from '../definition';
import type { Period } from '../period';
import type { GroupedValuesPlan } from './groupedValues';
import type { DateRange, SectionQueryPlan } from './types';

export interface TreemapQueryPlan {
  sectionId: string;
  source: SourceDefinition;
  timeZone: string;
  dateRange: DateRange;
  measure: { column: string; transform?: ValueTransform };
  group: string | null;
  category: string;
}

export function planDonutParts(
  section: DonutSection,
  period: Period,
  timeZone: string
): GroupedValuesPlan {
  return {
    sectionId: section.id,
    source: section.source,
    timeZone,
    dateRange: { firstDate: period.firstDate, lastDate: period.lastDate },
    measures: [
      {
        column: section.value.column,
        reduction: section.value.reduction,
        transform: section.value.transform,
      },
    ],
    buckets: null,
    category: {
      column: section.category,
      sortKey: section.order === 'value-desc' ? null : section.order.sortKey,
    },
  };
}

export function planDonutCenter(
  section: DonutSection,
  period: Period,
  timeZone: string
): Extract<SectionQueryPlan, { kind: 'stat-tiles' }> | null {
  if (section.centerColumn === undefined) return null;
  return {
    kind: SectionKind.STAT_TILES,
    sectionId: section.id,
    grain: period.grain,
    source: {
      ...section.source,
      filters: [
        ...(section.source.filters ?? []),
        { column: section.centerColumn, operator: 'is-not-null' },
      ],
    },
    timeZone,
    selectedPeriod: period.toString(),
    dateRange: { firstDate: period.firstDate, lastDate: period.lastDate },
    measures: [
      {
        column: section.centerColumn,
        reduction: Reduction.LATEST,
        compares: false,
      },
    ],
  };
}

export function planTreemapParts(
  section: TreemapSection,
  period: Period,
  timeZone: string
): TreemapQueryPlan {
  if (section.value.reduction !== Reduction.SUM) {
    throw new Error('A treemap adds values up and requires the sum reduction');
  }
  return {
    sectionId: section.id,
    source: section.source,
    timeZone,
    dateRange: { firstDate: period.firstDate, lastDate: period.lastDate },
    measure: {
      column: section.value.column,
      transform: section.value.transform,
    },
    group: section.group ?? null,
    category: section.category,
  };
}
