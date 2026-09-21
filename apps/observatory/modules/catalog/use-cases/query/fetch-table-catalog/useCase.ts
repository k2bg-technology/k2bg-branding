import type { TableSummaryOutput } from '../../shared';
import type { FetchTableCatalogQueryService } from './queryService';

export type FetchTableCatalogOutput = TableSummaryOutput[];

export class FetchTableCatalog {
  constructor(private readonly queryService: FetchTableCatalogQueryService) {}

  async execute(): Promise<FetchTableCatalogOutput> {
    const { tables } = await this.queryService.fetchTableCatalog();
    return tables;
  }
}
