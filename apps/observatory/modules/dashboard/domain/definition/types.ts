import type { PeriodGrain, SectionGrain } from '../period';

export const SectionKind = {
  STAT_TILES: 'stat-tiles',
  TIME_SERIES: 'time-series',
  TABLE: 'table',
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

export interface ControlDefinition {
  id: string;
  label: string;
  column: string;
  options: string[];
  allLabel?: string;
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

export interface StatTilesSection {
  id: string;
  title: string;
  source: SourceDefinition;
  kind: typeof SectionKind.STAT_TILES;
  width?: SectionWidth;
  controls?: string[];
  tiles: StatTileDefinition[];
}

export interface TimeSeriesSection {
  id: string;
  title: string;
  source: SourceDefinition;
  kind: typeof SectionKind.TIME_SERIES;
  width?: SectionWidth;
  controls?: string[];
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

export interface TableSection {
  id: string;
  title: string;
  source: SourceDefinition;
  kind: typeof SectionKind.TABLE;
  width?: SectionWidth;
  controls?: string[];
  columns: TableColumnDefinition[];
  sort?: { column: string; direction: SortDirection };
  limit?: number;
  paging?: { pageSize: number };
  emptyMessage?: string;
}

export type AggregatingSection = StatTilesSection | TimeSeriesSection;
export type Section = AggregatingSection | TableSection;

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
  controls?: ControlDefinition[];
  defaultPeriod: 'latest-with-data' | 'last-complete';
  labels?: {
    period?: string;
    previousPeriod?: string;
    nextPeriod?: string;
    truncated?: string;
    previousPage?: string;
    nextPage?: string;
    pagination?: string;
    applyControls?: string;
  };
  sections: Section[];
}

export interface DefinitionViolation {
  path: (string | number)[];
  message: string;
}
