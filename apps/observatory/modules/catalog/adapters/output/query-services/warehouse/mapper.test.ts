import { describe, expect, it } from 'vitest';

import type { WarehouseRow } from '../../../../../../infrastructure/warehouse';
import { TableType } from '../../../../use-cases';
import { MappingError } from '../../../shared';
import { toTableSummaryOutput } from './mapper';

const LAST_MODIFIED_EPOCH_MILLISECONDS = 1_754_006_400_000; // 2025-08-01T00:00:00.000Z

function createTableRow(overrides: Partial<WarehouseRow> = {}): WarehouseRow {
  return {
    dataset_id: 'sample_dataset',
    table_name: 'daily_totals',
    table_type: 'BASE TABLE',
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
      datasetId: 'sample_dataset',
      name: 'daily_totals',
      type: TableType.TABLE,
      rowCount: 1200,
      sizeInBytes: 65536,
      lastModifiedAt: '2025-08-01T00:00:00.000Z',
    });
  });

  it.each([
    { tableType: 'BASE TABLE', expected: TableType.TABLE },
    { tableType: 'VIEW', expected: TableType.VIEW },
    { tableType: 'MATERIALIZED VIEW', expected: TableType.MATERIALIZED_VIEW },
    { tableType: 'SNAPSHOT', expected: TableType.SNAPSHOT },
    { tableType: 'EXTERNAL', expected: TableType.EXTERNAL },
    { tableType: 'CLONE', expected: TableType.OTHER },
  ])('maps table_type $tableType to $expected', ({ tableType, expected }) => {
    const row = createTableRow({ table_type: tableType });

    const result = toTableSummaryOutput(row);

    expect(result.type).toBe(expected);
  });

  it('maps null storage columns to null, as a view reports no storage', () => {
    const row = createTableRow({
      table_type: 'VIEW',
      row_count: null,
      size_bytes: null,
      last_modified_time: null,
    });

    const result = toTableSummaryOutput(row);

    expect(result).toMatchObject({
      type: TableType.VIEW,
      rowCount: null,
      sizeInBytes: null,
      lastModifiedAt: null,
    });
  });

  it.each([
    { label: 'dataset_id is missing', overrides: { dataset_id: undefined } },
    { label: 'table_name is not a string', overrides: { table_name: 42 } },
    { label: 'table_type is not a string', overrides: { table_type: 7 } },
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
