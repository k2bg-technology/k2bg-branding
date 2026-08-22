import 'server-only';

import { BigQuery } from '@google-cloud/bigquery';
import { logger } from 'logger';

import { readThroughDataCache, WAREHOUSE_CACHE_TAG } from './dataCache';

export type WarehouseRow = Record<string, unknown>;
export type WarehouseQueryParams = Record<string, string | number | boolean>;

export interface WarehouseQueryRequest {
  /** Stable query name; part of the cache key and the query log. */
  name: string;
  sql: string;
  params?: WarehouseQueryParams;
  /** Seconds the result stays fresh in the data cache. Required per query. */
  revalidate: number;
  /** Per-query override of the scan cost guard. */
  maximumBytesBilled?: number;
}

export interface WarehouseClient {
  query(request: WarehouseQueryRequest): Promise<WarehouseRow[]>;
}

export interface WarehouseClientConfig {
  projectId: string;
  /** Region of the warehouse datasets, e.g. `asia-northeast1`. */
  location: string;
}

/** Bounds the bytes a single query may scan (1 GiB) so a dashboard never runs an unbounded scan. */
const DEFAULT_MAXIMUM_BYTES_BILLED = 1024 ** 3;

const warehouseLogger = logger.child({ module: 'warehouse' });

let warehouseClientInstance: WarehouseClient | null = null;

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} environment variable is required to access the warehouse`
    );
  }
  return value;
}

function readConfigFromEnvironment(): WarehouseClientConfig {
  return {
    projectId: requireEnvironmentVariable('WAREHOUSE_PROJECT_ID'),
    location: requireEnvironmentVariable('WAREHOUSE_LOCATION'),
  };
}

/**
 * Normalize driver rows to plain JSON so a cache hit (JSON-parsed) and a
 * cache miss (live driver objects) have an identical shape.
 */
function toPlainRows(rows: unknown[]): WarehouseRow[] {
  return JSON.parse(JSON.stringify(rows));
}

function buildCacheKey(
  config: WarehouseClientConfig,
  request: WarehouseQueryRequest
): string[] {
  return [
    JSON.stringify({
      scope: WAREHOUSE_CACHE_TAG,
      projectId: config.projectId,
      name: request.name,
      sql: request.sql,
      params: request.params ?? {},
    }),
  ];
}

/** Create a new warehouse client. Use this for testing or when you need a fresh instance. */
export function createWarehouseClient(
  config: WarehouseClientConfig = readConfigFromEnvironment()
): WarehouseClient {
  const bigquery = new BigQuery({
    projectId: config.projectId,
    location: config.location,
  });

  return {
    query(request) {
      return readThroughDataCache(
        buildCacheKey(config, request),
        request.revalidate,
        async () => {
          warehouseLogger.info(
            { name: request.name },
            'Executing warehouse query'
          );
          const [rows] = await bigquery.query({
            query: request.sql,
            params: request.params,
            maximumBytesBilled: String(
              request.maximumBytesBilled ?? DEFAULT_MAXIMUM_BYTES_BILLED
            ),
          });
          return toPlainRows(rows);
        }
      );
    },
  };
}

/** Get the singleton warehouse client. Creates a new instance if one doesn't exist. */
export function getWarehouseClient(): WarehouseClient {
  if (!warehouseClientInstance) {
    warehouseClientInstance = createWarehouseClient();
  }
  return warehouseClientInstance;
}

/** Region of the warehouse datasets; qualifies region-scoped metadata views. */
export function getWarehouseLocation(): string {
  return requireEnvironmentVariable('WAREHOUSE_LOCATION');
}

/** Reset the singleton warehouse client. Primarily used for testing cleanup. */
export function resetWarehouseClient(): void {
  warehouseClientInstance = null;
}
