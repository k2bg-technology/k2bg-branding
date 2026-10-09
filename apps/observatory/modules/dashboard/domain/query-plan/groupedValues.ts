import type { SortKeyType, SourceDefinition } from '../definition';
import type { PeriodGrain } from '../period';
import type { DateRange, MeasureQueryPlan } from './types';

export interface SortKeyQueryPlan {
  column: string;
  type: SortKeyType;
}

export interface GroupedValuesPlan {
  sectionId: string;
  source: SourceDefinition;
  timeZone: string;
  dateRange: DateRange;
  measures: MeasureQueryPlan[];
  buckets: { grain: PeriodGrain; bucketLimit: number } | null;
  category: { column: string; sortKey: SortKeyQueryPlan | null } | null;
}
