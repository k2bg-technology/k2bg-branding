import { describe, expect, it, vi } from 'vitest';

import type { TableSummaryOutput } from '../../shared';
import type { FetchTableCatalogQueryService } from './queryService';
import { FetchTableCatalog } from './useCase';

function createTableSummaryOutput(
  overrides: Partial<TableSummaryOutput> = {}
): TableSummaryOutput {
  return {
    datasetId: 'finance',
    name: 'transactions',
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
        createTableSummaryOutput({ name: 'accounts' }),
        createTableSummaryOutput({ name: 'transactions' }),
      ];
      const queryService = createMockQueryService({
        fetchTableCatalog: vi.fn().mockResolvedValue({ tables }),
      });
      const sut = new FetchTableCatalog(queryService);

      const result = await sut.execute();

      expect(result).toEqual(tables);
    });

    it('propagates query service failures', async () => {
      const queryService = createMockQueryService({
        fetchTableCatalog: vi
          .fn()
          .mockRejectedValue(new Error('warehouse down')),
      });
      const sut = new FetchTableCatalog(queryService);

      await expect(sut.execute()).rejects.toThrow('warehouse down');
    });
  });
});
