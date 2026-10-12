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
  warmUpBuckets?: { period: string; values: (number | null)[] }[];
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
      warmUpBuckets?: {
        period: string;
        cells: { category: CategoryValue; values: (number | null)[] }[];
      }[];
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

export interface CompositionPart {
  group?: CategoryValue;
  category: CategoryValue;
  value: number | null;
  sortKey?: SortKeyValue;
}

export interface CompositionData {
  parts: CompositionPart[];
  center: number | null;
}

export type MatrixKey = string | null;
export type MatrixData =
  | { status: 'too-large' }
  | {
      status: 'ready';
      rowCategories: CategoryValue[] | null;
      columnCategories: CategoryValue[] | null;
      cells: { row: MatrixKey; column: MatrixKey; value: number | null }[];
    };
export interface PivotCell {
  row: CategoryValue;
  column: CategoryValue;
  value: number | null;
  sortKey?: SortKeyValue;
}

export interface PivotCells {
  cells: PivotCell[];
  exceeded: boolean;
}
