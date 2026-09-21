import type { TableSummaryOutput } from '../../shared';

export interface FetchTableCatalogResult {
  tables: TableSummaryOutput[];
}

export interface FetchTableCatalogQueryService {
  fetchTableCatalog(): Promise<FetchTableCatalogResult>;
}
