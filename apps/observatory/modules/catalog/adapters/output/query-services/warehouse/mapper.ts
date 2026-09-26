import type { WarehouseRow } from '../../../../../../infrastructure/warehouse';
import { type TableSummaryOutput, TableType } from '../../../../use-cases';
import { MappingError } from '../../../shared';

/** Warehouse `table_type` values; an unknown kind widens to `other`. */
const TABLE_TYPE_BY_WAREHOUSE_VALUE: Record<string, TableType | undefined> = {
  'BASE TABLE': TableType.TABLE,
  VIEW: TableType.VIEW,
  'MATERIALIZED VIEW': TableType.MATERIALIZED_VIEW,
  SNAPSHOT: TableType.SNAPSHOT,
  EXTERNAL: TableType.EXTERNAL,
};

function readString(row: WarehouseRow, key: string): string {
  const value = row[key];
  if (typeof value !== 'string') {
    throw new MappingError(`${key} must be a string, received ${typeof value}`);
  }
  return value;
}

function readNullableInteger(row: WarehouseRow, key: string): number | null {
  const value = row[key];
  if (value === null) {
    return null;
  }
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new MappingError(
      `${key} must be an integer, received ${JSON.stringify(value)}`
    );
  }
  return value;
}

/**
 * Map one catalog row to the table summary read model. An entry without
 * storage of its own, such as a view, arrives with null storage columns.
 * `last_modified_time` is milliseconds since the Unix epoch.
 */
export function toTableSummaryOutput(row: WarehouseRow): TableSummaryOutput {
  const lastModifiedTime = readNullableInteger(row, 'last_modified_time');
  return {
    datasetId: readString(row, 'dataset_id'),
    name: readString(row, 'table_name'),
    type:
      TABLE_TYPE_BY_WAREHOUSE_VALUE[readString(row, 'table_type')] ??
      TableType.OTHER,
    rowCount: readNullableInteger(row, 'row_count'),
    sizeInBytes: readNullableInteger(row, 'size_bytes'),
    lastModifiedAt:
      lastModifiedTime === null
        ? null
        : new Date(lastModifiedTime).toISOString(),
  };
}
