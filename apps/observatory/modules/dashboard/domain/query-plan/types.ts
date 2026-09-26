import type { Reduction, SectionKind, SourceDefinition } from '../definition';

export interface DateRange {
  firstDate: string;
  lastDate: string;
}

export interface MeasureQueryPlan {
  column: string;
  reduction: Reduction;
  compares: boolean;
}

export interface SectionQueryPlan {
  kind: SectionKind;
  sectionId: string;
  source: SourceDefinition;
  timeZone: string;
  dateRange: DateRange;
  selectedPeriod: string;
  measures: MeasureQueryPlan[];
}
