import type { WarehouseRow } from '../../../../../../infrastructure/warehouse';
import {
  parseBucketKey,
  parseCalendarDate,
  Reduction,
  resolveLatest,
  type SectionQueryPlan,
} from '../../../../domain';
import type { SectionData } from '../../../../use-cases';
import { MappingError } from '../../../shared';
import { distinctCountAlias, valueColumnAlias } from './aliases';
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
