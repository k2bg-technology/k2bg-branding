import { describe, expect, it, vi } from 'vitest';

import { FetchTableCatalog, TableType } from '../../modules/catalog/use-cases';
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
    dataset_id: 'sample_dataset',
    table_name: 'daily_totals',
    table_type: 'BASE TABLE',
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

    const tables = await sut.execute({ datasetIds: ['sample_dataset'] });

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'table-catalog',
        params: { dataset_0: 'sample_dataset' },
        sql: expect.stringContaining(
          `\`region-${TEST_LOCATION}\`.INFORMATION_SCHEMA.TABLE_STORAGE`
        ),
      })
    );
    expect(tables).toEqual([
      {
        datasetId: 'sample_dataset',
        name: 'daily_totals',
        type: TableType.TABLE,
        rowCount: 1200,
        sizeInBytes: 65536,
        lastModifiedAt: '2025-08-01T00:00:00.000Z',
      },
    ]);
  });
});
