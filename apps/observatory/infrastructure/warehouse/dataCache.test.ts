import { describe, expect, it, vi } from 'vitest';

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

  it('returns the loader result', async () => {
    const rows = [{ id: 1 }];
    const load = vi.fn().mockResolvedValue(rows);

    const result = await readThroughDataCache(['key'], 60, load);

    expect(result).toEqual(rows);
  });
});
