import { describe, expect, it } from 'vitest';

import type { WarehouseRow } from '../../../../../../infrastructure/warehouse';
import { MappingError } from '../../../shared';
import { toTableSummaryOutput } from './mapper';

const LAST_MODIFIED_EPOCH_MILLISECONDS = 1_754_006_400_000; // 2025-08-01T00:00:00.000Z

function createTableRow(overrides: Partial<WarehouseRow> = {}): WarehouseRow {
  return {
    dataset_id: 'finance',
    table_name: 'transactions',
    row_count: 1200,
    size_bytes: 65536,
    last_modified_time: LAST_MODIFIED_EPOCH_MILLISECONDS,
    ...overrides,
  };
}

describe('toTableSummaryOutput', () => {
  it('maps a warehouse row to the table summary read model', () => {
    const row = createTableRow();

    const result = toTableSummaryOutput(row);

    expect(result).toEqual({
      datasetId: 'finance',
      name: 'transactions',
      rowCount: 1200,
      sizeInBytes: 65536,
      lastModifiedAt: '2025-08-01T00:00:00.000Z',
    });
  });

  it('maps a null last_modified_time to a null timestamp', () => {
    const row = createTableRow({ last_modified_time: null });

    const result = toTableSummaryOutput(row);

    expect(result.lastModifiedAt).toBeNull();
  });

  it.each([
    { label: 'dataset_id is missing', overrides: { dataset_id: undefined } },
    { label: 'table_name is not a string', overrides: { table_name: 42 } },
    { label: 'row_count is a string', overrides: { row_count: '1200' } },
    { label: 'size_bytes is a float', overrides: { size_bytes: 1.5 } },
    {
      label: 'last_modified_time is a string',
      overrides: { last_modified_time: '2025-08-01' },
    },
  ])('throws MappingError when $label', ({ overrides }) => {
    const row = createTableRow(overrides);

    expect(() => toTableSummaryOutput(row)).toThrow(MappingError);
  });
});
