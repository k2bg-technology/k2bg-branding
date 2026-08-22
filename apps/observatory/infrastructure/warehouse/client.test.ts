import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createWarehouseClient,
  getWarehouseClient,
  getWarehouseLocation,
  resetWarehouseClient,
  type WarehouseQueryRequest,
} from './client';

const { bigQueryConstructorMock, queryMock, unstableCacheMock, infoMock } =
  vi.hoisted(() => ({
    bigQueryConstructorMock: vi.fn(),
    queryMock: vi.fn(),
    unstableCacheMock: vi.fn(
      (load: () => Promise<unknown>, _keyParts: string[], _options: unknown) =>
        load
    ),
    infoMock: vi.fn(),
  }));

vi.mock('server-only', () => ({}));

vi.mock('@google-cloud/bigquery', () => ({
  BigQuery: class {
    query = queryMock;
    constructor(options: unknown) {
      bigQueryConstructorMock(options);
    }
  },
}));

vi.mock('next/cache', () => ({
  unstable_cache: unstableCacheMock,
}));

vi.mock('logger', () => ({
  logger: { child: () => ({ info: infoMock }) },
}));

const TEST_PROJECT_ID = 'test-project';
const TEST_LOCATION = 'asia-northeast1';
const ONE_HOUR_IN_SECONDS = 3600;
const DEFAULT_MAXIMUM_BYTES_BILLED = '1073741824';

const originalEnvironment = { ...process.env };

function createRequest(
  overrides: Partial<WarehouseQueryRequest> = {}
): WarehouseQueryRequest {
  return {
    name: 'sample-query',
    sql: 'SELECT 1 AS value',
    revalidate: ONE_HOUR_IN_SECONDS,
    ...overrides,
  };
}

describe('warehouse/client', () => {
  beforeEach(() => {
    resetWarehouseClient();
    bigQueryConstructorMock.mockClear();
    queryMock.mockReset();
    queryMock.mockResolvedValue([[]]);
    unstableCacheMock.mockClear();
    infoMock.mockClear();
    process.env.WAREHOUSE_PROJECT_ID = TEST_PROJECT_ID;
    process.env.WAREHOUSE_LOCATION = TEST_LOCATION;
  });

  afterEach(() => {
    resetWarehouseClient();
    process.env = { ...originalEnvironment };
  });

  describe('createWarehouseClient', () => {
    it('creates different instances on each call', () => {
      const client1 = createWarehouseClient();
      const client2 = createWarehouseClient();

      expect(client1).not.toBe(client2);
    });

    it('initialises the driver with the configured project id and location', () => {
      createWarehouseClient();

      expect(bigQueryConstructorMock).toHaveBeenCalledWith({
        projectId: TEST_PROJECT_ID,
        location: TEST_LOCATION,
      });
    });

    it.each([
      { name: 'WAREHOUSE_PROJECT_ID', label: 'unset', value: undefined },
      { name: 'WAREHOUSE_PROJECT_ID', label: 'empty', value: '' },
      { name: 'WAREHOUSE_LOCATION', label: 'unset', value: undefined },
      { name: 'WAREHOUSE_LOCATION', label: 'empty', value: '' },
    ])(
      'throws when $name is $label',
      ({ name, value }: { name: string; value: string | undefined }) => {
        if (value === undefined) {
          delete process.env[name];
        } else {
          process.env[name] = value;
        }

        expect(() => createWarehouseClient()).toThrow(
          `${name} environment variable is required`
        );
      }
    );
  });

  describe('getWarehouseClient', () => {
    it('returns the same instance on repeated calls', () => {
      const client1 = getWarehouseClient();
      const client2 = getWarehouseClient();

      expect(client1).toBe(client2);
      expect(bigQueryConstructorMock).toHaveBeenCalledTimes(1);
    });

    it('returns a new instance after reset', () => {
      const client1 = getWarehouseClient();
      resetWarehouseClient();

      const client2 = getWarehouseClient();

      expect(client1).not.toBe(client2);
    });
  });

  describe('getWarehouseLocation', () => {
    it('returns the configured location', () => {
      const location = getWarehouseLocation();

      expect(location).toBe(TEST_LOCATION);
    });

    it('throws when WAREHOUSE_LOCATION is unset', () => {
      delete process.env.WAREHOUSE_LOCATION;

      expect(() => getWarehouseLocation()).toThrow(
        'WAREHOUSE_LOCATION environment variable is required'
      );
    });
  });

  describe('query', () => {
    it('forwards the sql, params and default scan guard to the driver', async () => {
      const sut = createWarehouseClient();
      const params = { limit: 10 };

      await sut.query(createRequest({ params }));

      expect(queryMock).toHaveBeenCalledWith({
        query: 'SELECT 1 AS value',
        params,
        maximumBytesBilled: DEFAULT_MAXIMUM_BYTES_BILLED,
      });
    });

    it('honours a per-query scan guard override', async () => {
      const sut = createWarehouseClient();
      const maximumBytesBilled = 5_000;

      await sut.query(createRequest({ maximumBytesBilled }));

      expect(queryMock).toHaveBeenCalledWith(
        expect.objectContaining({ maximumBytesBilled: '5000' })
      );
    });

    it('normalizes driver rows to plain JSON values', async () => {
      const timestampLike = {
        value: '2026-01-01T00:00:00.000Z',
        toJSON: () => '2026-01-01T00:00:00.000Z',
      };
      queryMock.mockResolvedValue([[{ id: 1, createdAt: timestampLike }]]);
      const sut = createWarehouseClient();

      const rows = await sut.query(createRequest());

      expect(rows).toEqual([{ id: 1, createdAt: '2026-01-01T00:00:00.000Z' }]);
    });

    it('caches under a key that identifies the project, query name, sql and params', async () => {
      const sut = createWarehouseClient();
      const params = { year: 2026 };

      await sut.query(createRequest({ params }));

      const [, keyParts, options] = unstableCacheMock.mock.calls[0];
      expect(JSON.parse(keyParts[0])).toEqual({
        scope: 'warehouse',
        projectId: TEST_PROJECT_ID,
        name: 'sample-query',
        sql: 'SELECT 1 AS value',
        params,
      });
      expect(options).toEqual({
        revalidate: ONE_HOUR_IN_SECONDS,
        tags: ['warehouse'],
      });
    });

    it('logs the query name when the loader runs', async () => {
      const sut = createWarehouseClient();

      await sut.query(createRequest());

      expect(infoMock).toHaveBeenCalledWith(
        { name: 'sample-query' },
        'Executing warehouse query'
      );
    });

    it('propagates driver failures', async () => {
      queryMock.mockRejectedValue(new Error('permission denied'));
      const sut = createWarehouseClient();

      await expect(sut.query(createRequest())).rejects.toThrow(
        'permission denied'
      );
    });
  });
});
