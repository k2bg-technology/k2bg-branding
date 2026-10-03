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
  grain: PeriodGrain;
  source: SourceDefinition;
  timeZone: string;
  dateRange: DateRange;
  selectedPeriod: string;
}

export type SectionQueryPlan =
  | (BaseSectionQueryPlan & {
      kind: typeof SectionKind.STAT_TILES;
      measures: (MeasureQueryPlan & { compares: boolean })[];
    })
  | (BaseSectionQueryPlan & {
      kind: typeof SectionKind.TIME_SERIES;
      measures: MeasureQueryPlan[];
      bucketLimit: number;
    });
