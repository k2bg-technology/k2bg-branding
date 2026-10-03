import type { TableSummaryOutput } from '../../shared';
import type { FetchTableCatalogQueryService } from './queryService';

export interface FetchTableCatalogInput {
  datasetIds: string[];
}

export type FetchTableCatalogOutput = TableSummaryOutput[];

/**
 * Use case: list the tables and views of the given datasets.
 */
export class FetchTableCatalog {
  constructor(private readonly queryService: FetchTableCatalogQueryService) {}

  async execute(
    input: FetchTableCatalogInput
  ): Promise<FetchTableCatalogOutput> {
    // No dataset means nothing to list, so the warehouse is left alone.
    if (input.datasetIds.length === 0) {
      return [];
    }

    const { tables } = await this.queryService.fetchTableCatalog({
      datasetIds: input.datasetIds,
    });
    return tables;
  }
}
