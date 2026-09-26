import { beforeEach, describe, expect, it, vi } from 'vitest';

import { readThroughDataCache, WAREHOUSE_CACHE_TAG } from './dataCache';

const { unstableCacheMock } = vi.hoisted(() => ({
  unstableCacheMock: vi.fn(
    (load: () => Promise<unknown>, _keyParts: string[], _options: unknown) =>
      load
  ),
}));

vi.mock('next/cache', () => ({
  unstable_cache: unstableCacheMock,
}));

describe('readThroughDataCache', () => {
  beforeEach(() => {
    unstableCacheMock.mockReset();
    unstableCacheMock.mockImplementation((load) => load);
  });

  it('registers the loader under the key parts with the revalidate window and warehouse tag', async () => {
    const keyParts = ['warehouse', 'sample'];
    const revalidateSeconds = 3600;
    const load = vi.fn().mockResolvedValue(['row']);

    await readThroughDataCache(keyParts, revalidateSeconds, load);

    expect(unstableCacheMock).toHaveBeenCalledWith(load, keyParts, {
      revalidate: revalidateSeconds,
      tags: [WAREHOUSE_CACHE_TAG],
    });
  });

  it('reuses results for the same key and loads distinct keys separately', async () => {
    const cachedResults = new Map<string, Promise<unknown>>();
    unstableCacheMock.mockImplementation((load, keyParts) => () => {
      const key = JSON.stringify(keyParts);
      const cachedResult = cachedResults.get(key);
      if (cachedResult) {
        return cachedResult;
      }
      const result = load();
      cachedResults.set(key, result);
      return result;
    });
    const firstLoad = vi.fn().mockResolvedValue([{ id: 1 }]);
    const repeatLoad = vi.fn().mockResolvedValue([{ id: 99 }]);
    const otherLoad = vi.fn().mockResolvedValue([{ id: 2 }]);

    const firstRead = await readThroughDataCache(['first'], 60, firstLoad);
    const repeatRead = await readThroughDataCache(['first'], 60, repeatLoad);
    const otherRead = await readThroughDataCache(['other'], 60, otherLoad);

    expect(firstRead).toEqual([{ id: 1 }]);
    expect(repeatRead).toEqual([{ id: 1 }]);
    expect(otherRead).toEqual([{ id: 2 }]);
  });
});
