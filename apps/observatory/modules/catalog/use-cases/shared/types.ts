/** Read model of one warehouse table, across every dataset of the project. */
export interface TableSummaryOutput {
  datasetId: string;
  name: string;
  rowCount: number;
  sizeInBytes: number;
  /** ISO 8601 timestamp of the last data write; null for a table with no data. */
  lastModifiedAt: string | null;
}
