import { describe, expect, it, vi } from 'vitest';

import { type TableSummaryOutput, TableType } from '../../shared';
import type { FetchTableCatalogQueryService } from './queryService';
import { FetchTableCatalog } from './useCase';

function createTableSummaryOutput(
  overrides: Partial<TableSummaryOutput> = {}
): TableSummaryOutput {
  return {
    datasetId: 'sample_dataset',
    name: 'daily_totals',
    type: TableType.TABLE,
    rowCount: 1200,
    sizeInBytes: 65536,
    lastModifiedAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  };
}

function createMockQueryService(
  overrides: Partial<FetchTableCatalogQueryService> = {}
): FetchTableCatalogQueryService {
  return {
    fetchTableCatalog: vi.fn().mockResolvedValue({ tables: [] }),
    ...overrides,
  };
}

describe('FetchTableCatalog', () => {
  describe('execute', () => {
    it('returns the tables reported by the query service', async () => {
      const tables = [
        createTableSummaryOutput({ name: 'daily_totals' }),
        createTableSummaryOutput({ name: 'monthly_totals' }),
      ];
      const queryService = createMockQueryService({
        fetchTableCatalog: vi.fn().mockResolvedValue({ tables }),
      });
      const sut = new FetchTableCatalog(queryService);

      const result = await sut.execute({ datasetIds: ['sample_dataset'] });

      expect(result).toEqual(tables);
    });

    it('asks the query service for the requested datasets', async () => {
      const queryService = createMockQueryService();
      const sut = new FetchTableCatalog(queryService);
      const datasetIds = ['other_dataset', 'sample_dataset'];

      await sut.execute({ datasetIds });

      expect(queryService.fetchTableCatalog).toHaveBeenCalledWith({
        datasetIds,
      });
    });

    it('returns an empty catalog without querying when no dataset is requested', async () => {
      const queryService = createMockQueryService();
      const sut = new FetchTableCatalog(queryService);

      const result = await sut.execute({ datasetIds: [] });

      expect(result).toEqual([]);
      expect(queryService.fetchTableCatalog).not.toHaveBeenCalled();
    });

    it('propagates query service failures', async () => {
      const queryService = createMockQueryService({
        fetchTableCatalog: vi
          .fn()
          .mockRejectedValue(new Error('warehouse down')),
      });
      const sut = new FetchTableCatalog(queryService);

      await expect(
        sut.execute({ datasetIds: ['sample_dataset'] })
      ).rejects.toThrow('warehouse down');
    });
  });
});
