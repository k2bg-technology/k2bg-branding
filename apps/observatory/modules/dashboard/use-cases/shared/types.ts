import type { DateBounds } from '../../domain';

export interface DefinitionIssue {
  fileName: string;
  path: string;
  message: string;
}

export interface QueryOptions {
  name: string;
  revalidate: number;
}

export interface PeriodBoundsResult {
  bounds: DateBounds | null;
}

export interface SectionData {
  values: (number | null)[];
}
