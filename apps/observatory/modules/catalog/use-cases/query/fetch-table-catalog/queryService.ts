import type { TableSummaryOutput } from '../../shared';

export interface FetchTableCatalogQuery {
  /** Datasets to list; never empty, and each one a warehouse identifier. */
  datasetIds: string[];
}

export interface FetchTableCatalogResult {
  tables: TableSummaryOutput[];
}

/**
 * Query service interface for listing the tables and views of given datasets
 */
export interface FetchTableCatalogQueryService {
  fetchTableCatalog(
    query: FetchTableCatalogQuery
  ): Promise<FetchTableCatalogResult>;
}
