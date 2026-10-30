import { beforeEach, describe, expect, it, vi } from 'vitest';

import { readThroughDataCache } from './dataCache';

const { cacheLifeMock, cacheTagMock } = vi.hoisted(() => ({
  cacheLifeMock: vi.fn(),
  cacheTagMock: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@google-cloud/bigquery', () => ({
  BigQuery: class {
    async query() {
      return [[]];
    }
  },
}));
vi.mock('next/cache', () => ({
  cacheLife: cacheLifeMock,
  cacheTag: cacheTagMock,
}));
vi.mock('logger', () => ({
  logger: { child: () => ({ info: vi.fn() }) },
}));

describe('readThroughDataCache', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([3600, 86_400])(
    'sets the declared %i-second refresh window and warehouse invalidation tag',
    async (revalidate) => {
      await readThroughDataCache(
        { projectId: 'test-project', location: 'asia-northeast1' },
        { name: 'sample-query', sql: 'SELECT 1 AS value', revalidate }
      );

      expect(cacheLifeMock).toHaveBeenCalledWith({ revalidate });
      expect(cacheTagMock).toHaveBeenCalledWith('warehouse');
    }
  );
});
