import { unstable_cache } from 'next/cache';

/** Tag shared by every cached warehouse read; invalidate with `revalidateTag`. */
export const WAREHOUSE_CACHE_TAG = 'warehouse';

/**
 * Read through the Next.js data cache. The entry is keyed by `keyParts` and
 * stays fresh for `revalidate` seconds; loader failures are never cached.
 */
export function readThroughDataCache<T>(
  keyParts: string[],
  revalidate: number,
  load: () => Promise<T>
): Promise<T> {
  return unstable_cache(load, keyParts, {
    revalidate,
    tags: [WAREHOUSE_CACHE_TAG],
  })();
}
