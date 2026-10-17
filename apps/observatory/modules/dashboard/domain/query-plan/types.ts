import type {
  Reduction,
  SectionKind,
  SourceDefinition,
  ValueTransform,
} from '../definition';
import type { PeriodGrain } from '../period';

export interface DateRange {
  firstDate: string;
  lastDate: string;
}

export interface MeasureQueryPlan {
  column: string;
  reduction: Reduction;
  transform?: ValueTransform;
}

interface BaseSectionQueryPlan {
  sectionId: string;
  source: SourceDefinition;
  timeZone: string;
  dateRange: DateRange;
  selectedPeriod: string;
}

export type SectionQueryPlan =
  | (BaseSectionQueryPlan & {
      kind: typeof SectionKind.STAT_TILES;
      grain: PeriodGrain;
      measures: (MeasureQueryPlan & {
        compares: boolean;
        sparkline?: { window: number };
        firstPeriod?: string;
      })[];
    })
  | (BaseSectionQueryPlan &
      (
        | { grain: PeriodGrain; firstHour?: never }
        | { grain: 'hour'; firstHour: number }
      ) & {
        kind: typeof SectionKind.TIME_SERIES;
        measures: MeasureQueryPlan[];
        bucketLimit: number;
        warmUp?: WarmUpPlan;
      })
  | (BaseSectionQueryPlan & {
      kind: typeof SectionKind.CALENDAR_HEATMAP;
      grain: 'day';
      measures: MeasureQueryPlan[];
    });

export interface WarmUpPlan {
  /** Buckets read before the displayed window for a trailing computation. */
  lookback: number;
  /** Bucket key of the first displayed bucket; earlier returned buckets are warm-up. */
  displayFrom: string;
}
