import type { WarehouseRow } from '../../../../../../infrastructure/warehouse';
import {
  parseBucketKey,
  parseCalendarDate,
  Reduction,
  resolveLatest,
  type SectionQueryPlan,
  type TableQueryPlan,
} from '../../../../domain';
import type { SectionData, TableCell, TableRows } from '../../../../use-cases';
import { MappingError } from '../../../shared';
import {
  cellColumnAlias,
  distinctCountAlias,
  NOT_READY_COUNT_ALIAS,
  PAGE_COUNT_ALIAS,
  PAGE_NUMBER_ALIAS,
  valueColumnAlias,
} from './aliases';
import { FIRST_DATE_ALIAS, LAST_DATE_ALIAS } from './query';

function readCalendarDate(row: WarehouseRow, key: string): string {
  const value = row[key];
  if (typeof value !== 'string' || parseCalendarDate(value) === null) {
    throw new MappingError(
      `${key} must be a calendar date, received ${JSON.stringify(value)}`
    );
  }
  return value;
}

export function toSectionReadiness(rows: WarehouseRow[]): boolean {
  const row = rows[0];
  if (row === undefined) {
    throw new MappingError(
      `${NOT_READY_COUNT_ALIAS} must be returned in one row`
    );
  }
  const value = readNullableNumber(row, NOT_READY_COUNT_ALIAS);
  if (value === null || !Number.isInteger(value) || value < 0) {
    throw new MappingError(
      `${NOT_READY_COUNT_ALIAS} must be a non-negative integer, received ${JSON.stringify(value)}`
    );
  }
  return value === 0;
}

function readNullableNumber(row: WarehouseRow, key: string): number | null {
  const value = row[key];
  if (value === null) {
    return null;
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new MappingError(
      `${key} must be a finite number or null, received ${JSON.stringify(value)}`
    );
  }
  return value;
}

function readDistinctCount(row: WarehouseRow, key: string): number {
  const value = readNullableNumber(row, key);
  if (value === null || !Number.isInteger(value) || value < 0) {
    throw new MappingError(
      `${key} must be a non-negative integer, received ${JSON.stringify(value)}`
    );
  }
  return value;
}

export function toDateBounds(rows: WarehouseRow[]) {
  const row = rows[0];
  return row === undefined
    ? null
    : {
        firstDate: readCalendarDate(row, FIRST_DATE_ALIAS),
        lastDate: readCalendarDate(row, LAST_DATE_ALIAS),
      };
}

export function toSectionData(
  rows: WarehouseRow[],
  plan: SectionQueryPlan
): SectionData | null {
  if (rows.length === 0) {
    return null;
  }

  const includedRows =
    plan.kind === 'time-series'
      ? rows.slice(0, plan.bucketLimit).reverse()
      : rows;
  return {
    truncated: plan.kind === 'time-series' && rows.length > plan.bucketLimit,
    buckets: includedRows.map((row) => {
      const period = row.period;
      if (
        typeof period !== 'string' ||
        parseBucketKey(plan.grain, period) === null
      ) {
        throw new MappingError(
          `period must match ${plan.grain} grain, received ${JSON.stringify(period)}`
        );
      }
      return {
        period,
        values: plan.measures.map((measure, index) => {
          if (
            plan.kind === 'stat-tiles' &&
            period !== plan.selectedPeriod &&
            !('compares' in measure && measure.compares)
          ) {
            return null;
          }
          const value = readNullableNumber(row, valueColumnAlias(index));
          return measure.reduction === Reduction.LATEST
            ? resolveLatest(
                value,
                readDistinctCount(row, distinctCountAlias(index)),
                {
                  sectionId: plan.sectionId,
                  column: measure.column,
                }
              )
            : value;
        }),
      };
    }),
  };
}

function readCell(
  row: WarehouseRow,
  key: string,
  type: TableQueryPlan['columns'][number]['type']
): TableCell {
  const value = row[key];
  if (value === null) {
    return null;
  }
  if (type === 'number' || type === 'timestamp') {
    return readNullableNumber(row, key);
  }
  if (
    typeof value === 'string' &&
    (type !== 'date' || parseCalendarDate(value) !== null)
  ) {
    return value;
  }
  throw new MappingError(
    `${key} must be ${type === 'date' ? 'a calendar date' : 'a string'} or null, received ${JSON.stringify(value)}`
  );
}

function readPageNumber(row: WarehouseRow, key: string): number {
  const value = row[key];
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new MappingError(
      `${key} must be a positive integer, received ${JSON.stringify(value)}`
    );
  }
  return value;
}

export function toTableRows(
  rows: WarehouseRow[],
  plan: TableQueryPlan
): TableRows | null {
  if (rows.length === 0) {
    return null;
  }
  const cells = rows.map((row) =>
    plan.columns.map((column, index) =>
      readCell(row, cellColumnAlias(index), column.type)
    )
  );
  if ('limit' in plan.rows) {
    return { rows: cells, page: null };
  }
  const number = readPageNumber(rows[0], PAGE_NUMBER_ALIAS);
  const count = readPageNumber(rows[0], PAGE_COUNT_ALIAS);
  if (number > count) {
    throw new MappingError(
      `${PAGE_NUMBER_ALIAS} must not exceed ${PAGE_COUNT_ALIAS}`
    );
  }
  return { rows: cells, page: { number, count } };
}
