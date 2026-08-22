import type { WarehouseClient } from '../../../../../../infrastructure/warehouse';
import type {
  FetchTableCatalogQueryService,
  FetchTableCatalogResult,
} from '../../../../use-cases';
import { RepositoryError } from '../../../shared';
import { toTableSummaryOutput } from './mapper';

/** Warehouse metadata changes at most daily; a day-long cache bounds scan costs. */
const TABLE_CATALOG_REVALIDATE_SECONDS = 60 * 60 * 24;

/** The location is interpolated into a region qualifier, so only allow region characters. */
const LOCATION_PATTERN = /^[a-z0-9-]+$/i;

function assertLocation(location: string): void {
  if (!LOCATION_PATTERN.test(location)) {
    throw new RepositoryError(
      `Invalid warehouse location: ${JSON.stringify(location)}`
    );
  }
}

/**
 * Region-scoped storage metadata for every base table in the project.
 * `storage_last_modified_time` is projected as epoch milliseconds so the
 * row stays plain JSON through the cache.
 */
function buildTableCatalogSql(location: string): string {
  return [
    'SELECT table_schema AS dataset_id, table_name,',
    'total_rows AS row_count, total_logical_bytes AS size_bytes,',
    'UNIX_MILLIS(storage_last_modified_time) AS last_modified_time',
    `FROM \`region-${location.toLowerCase()}\`.INFORMATION_SCHEMA.TABLE_STORAGE`,
    "WHERE deleted = false AND table_type = 'BASE TABLE'",
    'ORDER BY table_schema, table_name',
  ].join(' ');
}

export class WarehouseFetchTableCatalogQueryService
  implements FetchTableCatalogQueryService
{
  constructor(
    private readonly client: WarehouseClient,
    private readonly location: string
  ) {
    assertLocation(location);
  }

  async fetchTableCatalog(): Promise<FetchTableCatalogResult> {
    try {
      const rows = await this.client.query({
        name: 'table-catalog',
        sql: buildTableCatalogSql(this.location),
        revalidate: TABLE_CATALOG_REVALIDATE_SECONDS,
      });

      return { tables: rows.map(toTableSummaryOutput) };
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError('Failed to fetch table catalog', error);
    }
  }
}
