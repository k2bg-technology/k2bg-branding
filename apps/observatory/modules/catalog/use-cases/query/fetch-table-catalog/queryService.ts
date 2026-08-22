import type { TableSummaryOutput } from '../../shared';

export interface FetchTableCatalogResult {
  tables: TableSummaryOutput[];
}

/**
 * Query service interface for listing every table of the warehouse project
 */
export interface FetchTableCatalogQueryService {
  fetchTableCatalog(): Promise<FetchTableCatalogResult>;
}
