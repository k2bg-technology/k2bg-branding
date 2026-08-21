import type { WarehouseRow } from '../../../../../../infrastructure/warehouse';
import type { TableSummaryOutput } from '../../../../use-cases';
import { MappingError } from '../../../shared';

function readString(row: WarehouseRow, key: string): string {
  const value = row[key];
  if (typeof value !== 'string') {
    throw new MappingError(`${key} must be a string, received ${typeof value}`);
  }
  return value;
}

function readInteger(row: WarehouseRow, key: string): number {
  const value = row[key];
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new MappingError(
      `${key} must be an integer, received ${JSON.stringify(value)}`
    );
  }
  return value;
}

function readNullableInteger(row: WarehouseRow, key: string): number | null {
  return row[key] === null ? null : readInteger(row, key);
}

/**
 * Map one table-storage row to the table summary read model.
 * `last_modified_time` is milliseconds since the Unix epoch, or null when
 * the table holds no data.
 */
export function toTableSummaryOutput(row: WarehouseRow): TableSummaryOutput {
  const lastModifiedTime = readNullableInteger(row, 'last_modified_time');
  return {
    datasetId: readString(row, 'dataset_id'),
    name: readString(row, 'table_name'),
    rowCount: readInteger(row, 'row_count'),
    sizeInBytes: readInteger(row, 'size_bytes'),
    lastModifiedAt:
      lastModifiedTime === null
        ? null
        : new Date(lastModifiedTime).toISOString(),
  };
}
