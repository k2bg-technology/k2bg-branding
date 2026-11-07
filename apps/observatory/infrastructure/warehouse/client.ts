import 'server-only';

import { readThroughDataCache } from './dataCache';

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

// biome-ignore lint/plugin/noLet: The lazy warehouse client persists across server requests.
let warehouseClientInstance: WarehouseClient | null = null;

function requireEnvironmentVariable(name: string) {
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

export function createWarehouseClient(
  config: WarehouseClientConfig = readConfigFromEnvironment()
): WarehouseClient {
  return {
    query: (request) => readThroughDataCache(config, request),
  };
}

export function getWarehouseClient(): WarehouseClient {
  if (!warehouseClientInstance) {
    warehouseClientInstance = createWarehouseClient();
  }
  return warehouseClientInstance;
}

export function getWarehouseLocation(): string {
  return requireEnvironmentVariable('WAREHOUSE_LOCATION');
}

export function resetWarehouseClient(): void {
  warehouseClientInstance = null;
}
