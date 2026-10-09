import type { PeriodGrain, SectionGrain } from '../period';

export const SectionKind = {
  STAT_TILES: 'stat-tiles',
  TIME_SERIES: 'time-series',
  TABLE: 'table',
  BARS: 'bars',
} as const;
export type SectionKind = (typeof SectionKind)[keyof typeof SectionKind];

export const Reduction = {
  SUM: 'sum',
  AVERAGE: 'average',
  MINIMUM: 'minimum',
  MAXIMUM: 'maximum',
  LATEST: 'latest',
} as const;
export type Reduction = (typeof Reduction)[keyof typeof Reduction];

export const SectionWidth = {
  FULL: 'full',
  HALF: 'half',
  THIRD: 'third',
} as const;
export type SectionWidth = (typeof SectionWidth)[keyof typeof SectionWidth];

export const PercentInputScale = {
  RATIO: 'ratio',
  PERCENT: 'percent',
} as const;
export type PercentInputScale =
  (typeof PercentInputScale)[keyof typeof PercentInputScale];

export type ValueFormat =
  | { type: 'number' }
  | { type: 'currency' }
  | { type: 'percent'; inputScale: PercentInputScale }
  | { type: 'duration'; inputUnit: 'seconds' | 'minutes' | 'hours' };

export type TimeBinding =
  | string
  | { column: string; type: 'timestamp' }
  | { date: string; hour: string };
export type FilterValue = string | number | boolean;
export type SourceFilter =
  | {
      column: string;
      operator:
        | 'equals'
        | 'not-equals'
        | 'less-than'
        | 'less-than-or-equal'
        | 'greater-than'
        | 'greater-than-or-equal';
      value: FilterValue;
    }
  | {
      column: string;
      operator: 'in' | 'not-in';
      values: FilterValue[];
    }
  | { column: string; operator: 'is-null' | 'is-not-null' };

export type ValueTransform = 'negate' | 'absolute';

export const TableColumnType = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  TIMESTAMP: 'timestamp',
} as const;
export type TableColumnType =
  (typeof TableColumnType)[keyof typeof TableColumnType];
export type TableAlignment = 'start' | 'end';
export type SortDirection = 'ascending' | 'descending';

interface TableColumnBase {
  header: string;
  column: string;
  alignment?: TableAlignment;
}

export type TableColumnDefinition =
  | (TableColumnBase & { type: 'text' | 'date' | 'timestamp' })
  | (TableColumnBase & {
      type: 'number';
      format: ValueFormat;
      unit?: string;
      transform?: ValueTransform;
    });

export interface SourceDefinition {
  dataset: string;
  view: string;
  time: TimeBinding;
  filters?: SourceFilter[];
}

export interface StatTileDefinition {
  label: string;
  column: string;
  reduction: Reduction;
  transform?: ValueTransform;
  format: ValueFormat;
  unit?: string;
  comparison?: {
    direction: 'higher-is-better' | 'lower-is-better' | 'neutral';
  };
}

export interface SectionAvailability {
  since: string;
  minimumBuckets?: number;
  note?: string;
}

export interface SectionReadiness {
  column: string;
  note?: string;
}

export interface SectionGateFields {
  period?: 'latest';
  availability?: SectionAvailability;
  readiness?: SectionReadiness;
}

export interface StatTilesSection extends SectionGateFields {
  id: string;
  title: string;
  source: SourceDefinition;
  kind: typeof SectionKind.STAT_TILES;
  width?: SectionWidth;
  tiles: StatTileDefinition[];
}

export interface TimeSeriesSection extends SectionGateFields {
  id: string;
  title: string;
  source: SourceDefinition;
  kind: typeof SectionKind.TIME_SERIES;
  width?: SectionWidth;
  grain?: SectionGrain;
  window?: number;
  variant: 'line' | 'area';
  stacked: boolean;
  format: ValueFormat;
  unit?: string;
  series: {
    label: string;
    column: string;
    reduction: Reduction;
    transform?: ValueTransform;
  }[];
}

export interface TableSection extends SectionGateFields {
  id: string;
  title: string;
  source: SourceDefinition;
  kind: typeof SectionKind.TABLE;
  width?: SectionWidth;
  columns: TableColumnDefinition[];
  sort?: { column: string; direction: SortDirection };
  limit?: number;
  paging?: { pageSize: number };
  emptyMessage?: string;
}

export type SortKeyType = 'text' | 'number';
export interface ValueBinding {
  column: string;
  reduction: Reduction;
  transform?: ValueTransform;
}
export interface TopN {
  count: number;
  otherLabel: string;
}
export type CategoryOrder =
  | 'value-desc'
  | { sortKey: { column: string; type: SortKeyType } };
export type BarsAxis =
  | { axis: 'time'; window: number }
  | {
      axis: 'category';
      column: string;
      by?: string;
      topN?: TopN;
      order: CategoryOrder;
    };

export interface BarsSection extends SectionGateFields {
  id: string;
  title: string;
  source: SourceDefinition;
  kind: typeof SectionKind.BARS;
  width?: SectionWidth;
  x: BarsAxis;
  series?: (ValueBinding & { label: string })[];
  pivot?: { column: string; value: ValueBinding; topN: TopN };
  stacked: boolean;
  format: ValueFormat;
  unit?: string;
}

export type AggregatingSection = StatTilesSection | TimeSeriesSection;
export type Section = AggregatingSection | TableSection | BarsSection;

export interface DashboardDefinition {
  id: string;
  title: string;
  description?: string;
  grain: PeriodGrain;
  timeZone: string;
  locale: string;
  currency?: string;
  revalidate: number;
  periodSource?: SourceDefinition;
  defaultPeriod: 'latest-with-data' | 'last-complete';
  labels?: {
    period?: string;
    previousPeriod?: string;
    nextPeriod?: string;
    truncated?: string;
    previousPage?: string;
    nextPage?: string;
    pagination?: string;
    asOf?: string;
    accumulatingSince?: string;
    availableFrom?: string;
    notReady?: string;
    nullCategory?: string;
  };
  sections: Section[];
}

export interface DefinitionViolation {
  path: (string | number)[];
  message: string;
}
