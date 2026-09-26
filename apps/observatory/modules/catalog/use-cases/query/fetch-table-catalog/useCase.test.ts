import { describe, expect, it, vi } from 'vitest';

import type { FetchTableCatalogQueryService } from './queryService';
import { FetchTableCatalog } from './useCase';

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
    it('returns an empty catalog without querying when no dataset is requested', async () => {
      const queryService = createMockQueryService();
      const sut = new FetchTableCatalog(queryService);

      const result = await sut.execute({ datasetIds: [] });

      expect(result).toEqual([]);
      expect(queryService.fetchTableCatalog).not.toHaveBeenCalled();
    });
  });
});
