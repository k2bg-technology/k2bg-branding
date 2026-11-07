import 'server-only';

import { BigQuery } from '@google-cloud/bigquery';
import { logger } from 'logger';
import { cacheLife, cacheTag } from 'next/cache';

import type {
  WarehouseClientConfig,
  WarehouseQueryRequest,
  WarehouseRow,
} from './client';

export const WAREHOUSE_CACHE_TAG = 'warehouse';

/** Bounds the bytes a single query may scan (1 GiB). */
const DEFAULT_MAXIMUM_BYTES_BILLED = 1024 ** 3;

const warehouseLogger = logger.child({ module: 'warehouse' });

export async function readThroughDataCache(
  config: WarehouseClientConfig,
  request: WarehouseQueryRequest
): Promise<WarehouseRow[]> {
  'use cache';

  cacheLife({ revalidate: request.revalidate });
  cacheTag(WAREHOUSE_CACHE_TAG);

  const bigquery = new BigQuery({
    projectId: config.projectId,
    location: config.location,
  });
  warehouseLogger.info({ name: request.name }, 'Executing warehouse query');
  const [rows] = await bigquery.query({
    query: request.sql,
    params: request.params,
    maximumBytesBilled: String(
      request.maximumBytesBilled ?? DEFAULT_MAXIMUM_BYTES_BILLED
    ),
  });
  // Driver instances must have the same plain JSON shape on cache hits and misses.
  return JSON.parse(JSON.stringify(rows));
}
