import type { CalendarRange, PeriodGrain, SectionGrain } from '../period';

export const SectionKind = {
  STAT_TILES: 'stat-tiles',
  TIME_SERIES: 'time-series',
  TABLE: 'table',
  BARS: 'bars',
  CALENDAR_HEATMAP: 'calendar-heatmap',
  DONUT: 'donut',
  TREEMAP: 'treemap',
  MATRIX_HEATMAP: 'matrix-heatmap',
  PIVOT_TABLE: 'pivot-table',
  SCATTER: 'scatter',
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
export type AggregateReduction = Exclude<Reduction, typeof Reduction.LATEST>;

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

interface ControlDefinitionBase {
  id: string;
  label: string;
  column: string;
  allLabel?: string;
}
export interface FixedListControlDefinition extends ControlDefinitionBase {
  options: string[];
}
export interface DistinctControlDefinition extends ControlDefinitionBase {
  options: 'distinct';
  source?: SourceDefinition;
  order: CategoryOrder;
  value?: ValueBinding;
}
export type ControlDefinition =
  | FixedListControlDefinition
  | DistinctControlDefinition;

export interface StatTileDefinition {
  label: string;
  column: string;
  reduction: Reduction;
  transform?: ValueTransform;
  format: ValueFormat;
  unit?: string;
  sparkline?: SparklineDefinition;
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
  controls?: string[];
  tiles: StatTileDefinition[];
}

export type SeriesInterpolation = 'linear' | 'step';

export type RunningAggregateKind = 'sum' | 'average';

export interface MovingAverageDefinition {
  window: number;
  label: string;
  minimumPoints?: number;
}

export interface RunningAggregateDefinition {
  kind: RunningAggregateKind;
  label: string;
}

export type RebaseBaseDefinition = 'first' | { date: string };

export interface RebaseDefinition {
  kind: 'rebase';
  base?: RebaseBaseDefinition;
}

export interface DerivedSeriesFields {
  movingAverage?: MovingAverageDefinition;
  running?: RunningAggregateDefinition;
  normalize?: RebaseDefinition;
}

export interface SparklineDefinition {
  window: number;
}

export interface LineSeriesDefinition {
  label: string;
  column: string;
  reduction: Reduction;
  transform?: ValueTransform;
  interpolation?: SeriesInterpolation;
  movingAverage?: MovingAverageDefinition;
  running?: RunningAggregateDefinition;
  normalize?: RebaseDefinition;
}

export interface BandSeriesDefinition {
  label: string;
  low: string;
  high: string;
  reduction: Reduction;
  interpolation?: SeriesInterpolation;
}

export type TimeSeriesSeriesDefinition =
  | LineSeriesDefinition
  | BandSeriesDefinition;

export interface TimeSeriesPivot {
  column: string;
  value: ValueBinding;
  topN?: TopN;
  interpolation?: SeriesInterpolation;
  movingAverage?: MovingAverageDefinition;
  running?: RunningAggregateDefinition;
  normalize?: RebaseDefinition;
}

export interface TimeSeriesSection extends SectionGateFields {
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
  series?: TimeSeriesSeriesDefinition[];
  pivot?: TimeSeriesPivot;
  thresholds?: { value: number; label?: string }[];
  bands?: { from: number; to: number }[];
}

export interface CalendarHeatmapSection extends SectionGateFields {
  id: string;
  title: string;
  source: SourceDefinition;
  kind: typeof SectionKind.CALENDAR_HEATMAP;
  width?: SectionWidth;
  range: CalendarRange;
  window?: number;
  value: { column: string; reduction: Reduction; transform?: ValueTransform };
  format: ValueFormat;
  unit?: string;
  maximum?: number;
  scaleLabels?: { less: string; more: string };
  controls?: string[];
}

export interface TableSection extends SectionGateFields {
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
  controls?: string[];
}

export interface DonutSection extends SectionGateFields {
  id: string;
  title: string;
  source: SourceDefinition;
  kind: typeof SectionKind.DONUT;
  width?: SectionWidth;
  controls?: string[];
  category: string;
  categoryLabel: string;
  value: ValueBinding & { label: string };
  order: CategoryOrder;
  topN?: TopN;
  centerColumn?: string;
  centerLabel?: string;
  format: ValueFormat;
  unit?: string;
}

export interface TreemapSection extends SectionGateFields {
  id: string;
  title: string;
  source: SourceDefinition;
  kind: typeof SectionKind.TREEMAP;
  width?: SectionWidth;
  controls?: string[];
  group?: string;
  groupLabel?: string;
  category: string;
  categoryLabel: string;
  value: ValueBinding & { label: string };
  topN?: TopN;
  format: ValueFormat;
  unit?: string;
}

export type CompositionSection = DonutSection | TreemapSection;
export type MatrixAxis =
  | { axis: 'date' }
  | { axis: 'hour' }
  | { axis: 'category'; column: string };

export interface MatrixHeatmapSection extends SectionGateFields {
  id: string;
  title: string;
  source: SourceDefinition;
  kind: typeof SectionKind.MATRIX_HEATMAP;
  width?: SectionWidth;
  controls?: string[];
  rows: MatrixAxis;
  columns: MatrixAxis;
  window?: number;
  value: {
    column: string;
    reduction: AggregateReduction;
    transform?: ValueTransform;
  };
  format: ValueFormat;
  unit?: string;
  minimum?: number;
  maximum?: number;
  scaleLabels?: { less: string; more: string };
}

export type PivotRowOrder =
  | 'total-desc'
  | 'as-provided'
  | { sortKey: { column: string; type: SortKeyType } };
export type PivotColumns =
  | { axis: 'time'; grain?: PeriodGrain; window?: number }
  | { axis: 'category'; column: string };

export interface PivotTableSection extends SectionGateFields {
  id: string;
  title: string;
  source: SourceDefinition;
  kind: typeof SectionKind.PIVOT_TABLE;
  width?: SectionWidth;
  controls?: string[];
  rows: { column: string; label: string; order: PivotRowOrder; topN?: TopN };
  columns: PivotColumns;
  value: ValueBinding;
  format: ValueFormat;
  unit?: string;
  totals?: { column?: string; row?: string };
}

export interface ScatterAxis {
  column: string;
  label: string;
  format: ValueFormat;
  unit?: string;
}

export interface ScatterSection extends SectionGateFields {
  id: string;
  title: string;
  source: SourceDefinition;
  kind: typeof SectionKind.SCATTER;
  width?: SectionWidth;
  controls?: string[];
  x: ScatterAxis;
  y: ScatterAxis;
  series?: { column: string; label: string };
  trendLine?: { slope: string; intercept: string };
  limit: number;
}

export type AggregatingSection =
  | StatTilesSection
  | TimeSeriesSection
  | CalendarHeatmapSection;
export type Section =
  | AggregatingSection
  | TableSection
  | BarsSection
  | CompositionSection
  | MatrixHeatmapSection
  | PivotTableSection
  | ScatterSection;

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
    asOf?: string;
    accumulatingSince?: string;
    availableFrom?: string;
    notReady?: string;
    nullCategory?: string;
    missingValue?: string;
    applyControls?: string;
    negativeComposition?: string;
    share?: string;
    controlOptionsUnavailable?: string;
    tooManySeries?: string;
    cellBudgetExceeded?: string;
    pointsTruncated?: string;
    trendLine?: string;
  };
  sections: Section[];
}

export interface DefinitionViolation {
  path: (string | number)[];
  message: string;
}
