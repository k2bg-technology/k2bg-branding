import type { WarehouseClient } from '../../../../../../infrastructure/warehouse';
import type {
  FetchTableCatalogQuery,
  FetchTableCatalogQueryService,
  FetchTableCatalogResult,
} from '../../../../use-cases';
import { RepositoryError } from '../../../shared';
import { toTableSummaryOutput } from './mapper';

/** Warehouse metadata changes at most daily; a day-long cache bounds scan costs. */
const TABLE_CATALOG_REVALIDATE_SECONDS = 60 * 60 * 24;

/** The location is interpolated into a region qualifier, so only allow region characters. */
const LOCATION_PATTERN = /^[a-z0-9-]+$/i;

/** Dataset ids are bound as parameters; the shape check is defence in depth. */
const DATASET_ID_PATTERN = /^[A-Za-z_][A-Za-z0-9_]{0,127}$/;

/**
 * Region-scoped tables and views of the given datasets, with the storage
 * metadata of whichever of them store rows. `storage_last_modified_time` is
 * projected as epoch milliseconds so the row stays plain JSON through the cache.
 */
function buildTableCatalogSql(
  location: string,
  parameterNames: string[]
): string {
  const region = `\`region-${location.toLowerCase()}\``;
  const placeholders = parameterNames
    .map((parameterName) => `@${parameterName}`)
    .join(', ');

  return [
    'SELECT tables.table_schema AS dataset_id, tables.table_name, tables.table_type,',
    'storage.total_rows AS row_count, storage.total_logical_bytes AS size_bytes,',
    'UNIX_MILLIS(storage.storage_last_modified_time) AS last_modified_time',
    `FROM ${region}.INFORMATION_SCHEMA.TABLES AS tables`,
    `LEFT JOIN ${region}.INFORMATION_SCHEMA.TABLE_STORAGE AS storage`,
    'ON storage.table_schema = tables.table_schema',
    'AND storage.table_name = tables.table_name',
    'AND storage.deleted = false',
    `WHERE tables.table_schema IN (${placeholders})`,
    'ORDER BY dataset_id, table_name',
  ].join(' ');
}

export class WarehouseFetchTableCatalogQueryService
  implements FetchTableCatalogQueryService
{
  constructor(
    private readonly client: WarehouseClient,
    private readonly location: string
  ) {
    if (!LOCATION_PATTERN.test(location)) {
      throw new RepositoryError(
        `Invalid warehouse location: ${JSON.stringify(location)}`
      );
    }
  }

  async fetchTableCatalog(
    query: FetchTableCatalogQuery
  ): Promise<FetchTableCatalogResult> {
    const invalidDatasetId = query.datasetIds.find(
      (datasetId) => !DATASET_ID_PATTERN.test(datasetId)
    );
    if (invalidDatasetId !== undefined) {
      throw new RepositoryError(
        `Invalid warehouse dataset id: ${JSON.stringify(invalidDatasetId)}`
      );
    }

    // One STRING parameter per dataset id; the client takes no array parameter.
    const params = Object.fromEntries(
      query.datasetIds.map((datasetId, index): [string, string] => [
        `dataset_${index}`,
        datasetId,
      ])
    );

    try {
      const rows = await this.client.query({
        name: 'table-catalog',
        sql: buildTableCatalogSql(this.location, Object.keys(params)),
        params,
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
