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

const SINGLE_DATASET_SQL =
  'SELECT tables.table_schema AS dataset_id, tables.table_name, tables.table_type, storage.total_rows AS row_count, storage.total_logical_bytes AS size_bytes, UNIX_MILLIS(storage.storage_last_modified_time) AS last_modified_time FROM `region-asia-northeast1`.INFORMATION_SCHEMA.TABLES AS tables LEFT JOIN `region-asia-northeast1`.INFORMATION_SCHEMA.TABLE_STORAGE AS storage ON storage.table_schema = tables.table_schema AND storage.table_name = tables.table_name AND storage.deleted = false WHERE tables.table_schema IN (@dataset_0) ORDER BY dataset_id, table_name';

const THREE_DATASET_SQL =
  'SELECT tables.table_schema AS dataset_id, tables.table_name, tables.table_type, storage.total_rows AS row_count, storage.total_logical_bytes AS size_bytes, UNIX_MILLIS(storage.storage_last_modified_time) AS last_modified_time FROM `region-asia-northeast1`.INFORMATION_SCHEMA.TABLES AS tables LEFT JOIN `region-asia-northeast1`.INFORMATION_SCHEMA.TABLE_STORAGE AS storage ON storage.table_schema = tables.table_schema AND storage.table_name = tables.table_name AND storage.deleted = false WHERE tables.table_schema IN (@dataset_0, @dataset_1, @dataset_2) ORDER BY dataset_id, table_name';

function createMockClient(rows: WarehouseRow[] = []): MockWarehouseClient {
  return { query: vi.fn().mockResolvedValue(rows) };
}

function createTableRow(overrides: Partial<WarehouseRow> = {}): WarehouseRow {
  return {
    dataset_id: 'sample_dataset',
    table_name: 'daily_totals',
    table_type: 'BASE TABLE',
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
    it('joins tables to their storage for one requested dataset', async () => {
      const client = createMockClient();
      const sut = new WarehouseFetchTableCatalogQueryService(
        client,
        TEST_LOCATION
      );

      await sut.fetchTableCatalog({ datasetIds: ['sample_dataset'] });

      expect(client.query).toHaveBeenCalledWith({
        name: 'table-catalog',
        sql: SINGLE_DATASET_SQL,
        params: { dataset_0: 'sample_dataset' },
        revalidate: ONE_DAY_IN_SECONDS,
      });
    });

    it('binds one parameter per dataset id', async () => {
      const client = createMockClient();
      const sut = new WarehouseFetchTableCatalogQueryService(
        client,
        TEST_LOCATION
      );

      await sut.fetchTableCatalog({
        datasetIds: ['sample_dataset', 'other_dataset', 'third_dataset'],
      });

      expect(client.query).toHaveBeenCalledWith({
        name: 'table-catalog',
        sql: THREE_DATASET_SQL,
        params: {
          dataset_0: 'sample_dataset',
          dataset_1: 'other_dataset',
          dataset_2: 'third_dataset',
        },
        revalidate: ONE_DAY_IN_SECONDS,
      });
    });

    it.each([
      { datasetId: 'sample dataset' },
      { datasetId: '1_dataset' },
      { datasetId: 'sample`; DROP TABLE y' },
      { datasetId: 'sample.dataset' },
      { datasetId: '' },
    ])(
      'throws RepositoryError without querying for dataset id $datasetId',
      async ({ datasetId }) => {
        const client = createMockClient();
        const sut = new WarehouseFetchTableCatalogQueryService(
          client,
          TEST_LOCATION
        );

        await expect(
          sut.fetchTableCatalog({ datasetIds: [datasetId] })
        ).rejects.toThrow(RepositoryError);
        expect(client.query).not.toHaveBeenCalled();
      }
    );

    it('lowercases the region qualifier', async () => {
      const client = createMockClient();
      const sut = new WarehouseFetchTableCatalogQueryService(client, 'US');

      await sut.fetchTableCatalog({ datasetIds: ['sample_dataset'] });

      expect(client.query).toHaveBeenCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining('`region-us`.INFORMATION_SCHEMA'),
        })
      );
    });

    it('returns the mapped tables in client order', async () => {
      const client = createMockClient([
        createTableRow({ table_name: 'daily_totals', row_count: 3 }),
        createTableRow({
          dataset_id: 'other_dataset',
          table_name: 'daily_summary',
          table_type: 'VIEW',
          row_count: null,
          size_bytes: null,
          last_modified_time: null,
        }),
      ]);
      const sut = new WarehouseFetchTableCatalogQueryService(
        client,
        TEST_LOCATION
      );

      const result = await sut.fetchTableCatalog({
        datasetIds: ['sample_dataset', 'other_dataset'],
      });

      expect(
        result.tables.map((table) => `${table.datasetId}.${table.name}`)
      ).toEqual(['sample_dataset.daily_totals', 'other_dataset.daily_summary']);
      expect(result.tables[0]).toMatchObject({
        type: 'table',
        rowCount: 3,
        sizeInBytes: 65536,
      });
      expect(result.tables[1]).toMatchObject({
        type: 'view',
        rowCount: null,
        sizeInBytes: null,
      });
    });

    it('returns an empty list when the datasets hold no tables', async () => {
      const client = createMockClient([]);
      const sut = new WarehouseFetchTableCatalogQueryService(
        client,
        TEST_LOCATION
      );

      const result = await sut.fetchTableCatalog({
        datasetIds: ['sample_dataset'],
      });

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

      const thrown = await sut
        .fetchTableCatalog({ datasetIds: ['sample_dataset'] })
        .catch((error) => error);

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

      await expect(
        sut.fetchTableCatalog({ datasetIds: ['sample_dataset'] })
      ).rejects.toThrow(MappingError);
    });
  });
});
