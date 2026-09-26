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
}
