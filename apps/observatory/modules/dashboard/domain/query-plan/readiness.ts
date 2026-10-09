import type { SourceDefinition } from '../definition';
import type { DateRange } from './types';

export interface ReadinessQueryPlan {
  sectionId: string;
  source: SourceDefinition;
  timeZone: string;
  dateRange: DateRange;
  column: string;
}
