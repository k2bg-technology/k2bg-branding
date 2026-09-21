export const SectionKind = {
  STAT_TILES: 'stat-tiles',
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
  | { type: 'percent'; inputScale: PercentInputScale };

export type TimeBinding = string | { column: string; type: 'timestamp' };

export interface SourceDefinition {
  dataset: string;
  view: string;
  time: TimeBinding;
}

export interface StatTileDefinition {
  label: string;
  column: string;
  reduction: Reduction;
  format: ValueFormat;
  unit?: string;
}

export interface StatTilesSection {
  id: string;
  title: string;
  source: SourceDefinition;
  kind: typeof SectionKind.STAT_TILES;
  width?: SectionWidth;
  tiles: StatTileDefinition[];
}

export type Section = StatTilesSection;

export interface DashboardDefinition {
  id: string;
  title: string;
  description?: string;
  grain: 'month';
  timeZone: string;
  locale: string;
  currency?: string;
  revalidate: number;
  sections: Section[];
}

export interface DefinitionViolation {
  path: (string | number)[];
  message: string;
}
