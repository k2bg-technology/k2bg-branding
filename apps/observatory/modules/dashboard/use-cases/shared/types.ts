export interface DefinitionIssue {
  fileName: string;
  path: string;
  message: string;
}

export interface QueryOptions {
  name: string;
  revalidate: number;
}

export interface SectionData {
  buckets: { period: string; values: (number | null)[] }[];
  truncated: boolean;
}

export type TableCell = string | number | null;

export interface TableRows {
  rows: TableCell[][];
  page: { number: number; count: number } | null;
}

export type {
  CategoryValue,
  SortKeyValue,
} from '../../domain/presentation/categoryValue';

import type {
  CategoryValue,
  SortKeyValue,
} from '../../domain/presentation/categoryValue';

export type GroupedValues =
  | {
      grouping: 'period';
      buckets: { period: string; values: (number | null)[] }[];
      truncated: boolean;
    }
  | {
      grouping: 'period-category';
      buckets: {
        period: string;
        cells: { category: CategoryValue; values: (number | null)[] }[];
      }[];
      truncated: boolean;
    }
  | {
      grouping: 'category';
      groups: {
        category: CategoryValue;
        values: (number | null)[];
        sortKey?: SortKeyValue;
      }[];
    };
