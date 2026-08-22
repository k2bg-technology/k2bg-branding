import { describe, expect, it, type Mock, vi } from 'vitest';

import type {
  WarehouseClient,
  WarehouseRow,
} from '../../../../../../infrastructure/warehouse';
import { MappingError, RepositoryError } from '../../../shared';
import { WarehouseFetchTableCatalogQueryService } from './fetchTableCatalogQueryService';

interface MockWarehouseClient extends WarehouseClient {
  query: Mock<WarehouseClient['query']>;
}

const TEST_LOCATION = 'asia-northeast1';
const ONE_DAY_IN_SECONDS = 86_400;

function createMockClient(rows: WarehouseRow[] = []): MockWarehouseClient {
  return { query: vi.fn().mockResolvedValue(rows) };
}

function createTableRow(overrides: Partial<WarehouseRow> = {}): WarehouseRow {
  return {
    dataset_id: 'finance',
    table_name: 'transactions',
    row_count: 1200,
    size_bytes: 65536,
    last_modified_time: 1_754_006_400_000,
    ...overrides,
  };
}

describe('WarehouseFetchTableCatalogQueryService', () => {
  describe('constructor', () => {
    it.each([
      { location: 'asia.northeast1' },
      { location: 'us`; DROP TABLE y' },
      { location: 'region us' },
      { location: '' },
    ])('throws RepositoryError for location $location', ({ location }) => {
      const client = createMockClient();

      expect(
        () => new WarehouseFetchTableCatalogQueryService(client, location)
      ).toThrow(RepositoryError);
    });
  });

  describe('fetchTableCatalog', () => {
    it('returns the mapped tables in client order', async () => {
      const client = createMockClient([
        createTableRow({ table_name: 'accounts', row_count: 3 }),
        createTableRow({ dataset_id: 'health', table_name: 'steps' }),
      ]);
      const sut = new WarehouseFetchTableCatalogQueryService(
        client,
        TEST_LOCATION
      );

      const result = await sut.fetchTableCatalog();

      expect(
        result.tables.map((table) => `${table.datasetId}.${table.name}`)
      ).toEqual(['finance.accounts', 'health.steps']);
      expect(result.tables[0]).toMatchObject({
        rowCount: 3,
        sizeInBytes: 65536,
      });
    });

    it('queries the region-scoped table storage view with a daily cache window', async () => {
      const client = createMockClient();
      const sut = new WarehouseFetchTableCatalogQueryService(
        client,
        TEST_LOCATION
      );

      await sut.fetchTableCatalog();

      expect(client.query).toHaveBeenCalledWith({
        name: 'table-catalog',
        sql: expect.stringContaining(
          `\`region-${TEST_LOCATION}\`.INFORMATION_SCHEMA.TABLE_STORAGE`
        ),
        revalidate: ONE_DAY_IN_SECONDS,
      });
    });

    it('lowercases the region qualifier', async () => {
      const client = createMockClient();
      const sut = new WarehouseFetchTableCatalogQueryService(client, 'US');

      await sut.fetchTableCatalog();

      expect(client.query).toHaveBeenCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining('`region-us`.INFORMATION_SCHEMA'),
        })
      );
    });

    it('returns an empty list when the warehouse has no tables', async () => {
      const client = createMockClient([]);
      const sut = new WarehouseFetchTableCatalogQueryService(
        client,
        TEST_LOCATION
      );

      const result = await sut.fetchTableCatalog();

      expect(result.tables).toEqual([]);
    });

    it('wraps client failures in RepositoryError preserving the cause', async () => {
      const driverError = new Error('permission denied');
      const client = createMockClient();
      client.query.mockRejectedValue(driverError);
      const sut = new WarehouseFetchTableCatalogQueryService(
        client,
        TEST_LOCATION
      );

      const thrown = await sut.fetchTableCatalog().catch((error) => error);

      expect(thrown).toBeInstanceOf(RepositoryError);
      expect(thrown.message).toBe('Failed to fetch table catalog');
      expect(thrown.cause).toBe(driverError);
    });

    it('rethrows MappingError unchanged when a row is malformed', async () => {
      const client = createMockClient([createTableRow({ row_count: 'many' })]);
      const sut = new WarehouseFetchTableCatalogQueryService(
        client,
        TEST_LOCATION
      );

      await expect(sut.fetchTableCatalog()).rejects.toThrow(MappingError);
    });
  });
});
