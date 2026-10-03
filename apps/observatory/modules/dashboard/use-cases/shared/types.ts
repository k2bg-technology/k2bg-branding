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
