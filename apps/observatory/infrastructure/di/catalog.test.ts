import { describe, expect, it, vi } from 'vitest';

import { FetchTableCatalog } from '../../modules/catalog/use-cases';
import type { WarehouseClient, WarehouseRow } from '../warehouse';
import { createFetchTableCatalogUseCase } from './catalog';

const { queryMock, getWarehouseLocationMock } = vi.hoisted(() => ({
  queryMock: vi.fn<WarehouseClient['query']>(),
  getWarehouseLocationMock: vi.fn<() => string>(),
}));

vi.mock('../warehouse', () => ({
  getWarehouseClient: (): WarehouseClient => ({ query: queryMock }),
  getWarehouseLocation: getWarehouseLocationMock,
}));

const TEST_LOCATION = 'asia-northeast1';

function createTableRow(): WarehouseRow {
  return {
    dataset_id: 'finance',
    table_name: 'transactions',
    row_count: 1200,
    size_bytes: 65536,
    last_modified_time: 1_754_006_400_000,
  };
}

describe('createFetchTableCatalogUseCase', () => {
  it('assembles a FetchTableCatalog use case', () => {
    getWarehouseLocationMock.mockReturnValue(TEST_LOCATION);

    const sut = createFetchTableCatalogUseCase();

    expect(sut).toBeInstanceOf(FetchTableCatalog);
  });

  it('queries the warehouse for the configured location and returns the mapped catalog', async () => {
    getWarehouseLocationMock.mockReturnValue(TEST_LOCATION);
    queryMock.mockResolvedValue([createTableRow()]);
    const sut = createFetchTableCatalogUseCase();

    const tables = await sut.execute();

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'table-catalog',
        sql: expect.stringContaining(
          `\`region-${TEST_LOCATION}\`.INFORMATION_SCHEMA.TABLE_STORAGE`
        ),
      })
    );
    expect(tables).toEqual([
      {
        datasetId: 'finance',
        name: 'transactions',
        rowCount: 1200,
        sizeInBytes: 65536,
        lastModifiedAt: '2025-08-01T00:00:00.000Z',
      },
    ]);
  });
});
