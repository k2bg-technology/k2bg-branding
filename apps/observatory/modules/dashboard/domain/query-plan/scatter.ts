import {
  Reduction,
  type ScatterSection,
  SectionKind,
  type SourceDefinition,
} from '../definition';
import type { Period } from '../period';
import type { DateRange, SectionQueryPlan } from './types';

export interface ScatterQueryPlan {
  sectionId: string;
  source: SourceDefinition;
  timeZone: string;
  dateRange: DateRange;
  x: string;
  y: string;
  series: string | null;
  limit: number;
}

export function planScatterPoints(
  section: ScatterSection,
  period: Period,
  timeZone: string
): ScatterQueryPlan {
  return {
    sectionId: section.id,
    source: section.source,
    timeZone,
    dateRange: { firstDate: period.firstDate, lastDate: period.lastDate },
    x: section.x.column,
    y: section.y.column,
    series: section.series?.column ?? null,
    limit: section.limit,
  };
}

export function planScatterTrend(
  section: ScatterSection,
  period: Period,
  timeZone: string
): Extract<SectionQueryPlan, { kind: 'stat-tiles' }> | null {
  if (section.trendLine === undefined) return null;
  const { slope, intercept } = section.trendLine;
  return {
    kind: SectionKind.STAT_TILES,
    sectionId: section.id,
    grain: period.grain,
    source: {
      ...section.source,
      filters: [
        ...(section.source.filters ?? []),
        { column: slope, operator: 'is-not-null' },
        { column: intercept, operator: 'is-not-null' },
      ],
    },
    timeZone,
    selectedPeriod: period.toString(),
    dateRange: { firstDate: period.firstDate, lastDate: period.lastDate },
    measures: [
      { column: slope, reduction: Reduction.LATEST, compares: false },
      { column: intercept, reduction: Reduction.LATEST, compares: false },
    ],
  };
}
