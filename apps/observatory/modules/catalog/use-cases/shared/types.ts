/** What a catalog entry is in the warehouse; `other` covers future kinds. */
export const TableType = {
  TABLE: 'table',
  VIEW: 'view',
  MATERIALIZED_VIEW: 'materialized-view',
  SNAPSHOT: 'snapshot',
  EXTERNAL: 'external',
  OTHER: 'other',
} as const;
export type TableType = (typeof TableType)[keyof typeof TableType];

/** Read model of one warehouse table or view. */
export interface TableSummaryOutput {
  datasetId: string;
  name: string;
  type: TableType;
  /** Stored rows; null for an entry with no storage of its own, such as a view. */
  rowCount: number | null;
  /** Stored bytes; null for an entry with no storage of its own. */
  sizeInBytes: number | null;
  /** ISO 8601 timestamp of the last data write; null without stored data. */
  lastModifiedAt: string | null;
}
