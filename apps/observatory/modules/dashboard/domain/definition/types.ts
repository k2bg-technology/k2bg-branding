export const SectionKind = {
  STAT_TILES: 'stat-tiles',
  TIME_SERIES: 'time-series',
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

export type TimeBinding = string | { column: string; type: 'timestamp' };
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

export interface StatTilesSection {
  id: string;
  title: string;
  source: SourceDefinition;
  kind: typeof SectionKind.STAT_TILES;
  width?: SectionWidth;
  tiles: StatTileDefinition[];
}

export interface TimeSeriesSection {
  id: string;
  title: string;
  source: SourceDefinition;
  kind: typeof SectionKind.TIME_SERIES;
  width?: SectionWidth;
  window: number;
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

export type Section = StatTilesSection | TimeSeriesSection;

export interface DashboardDefinition {
  id: string;
  title: string;
  description?: string;
  grain: 'month';
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
  };
  sections: Section[];
}

export interface DefinitionViolation {
  path: (string | number)[];
  message: string;
}
