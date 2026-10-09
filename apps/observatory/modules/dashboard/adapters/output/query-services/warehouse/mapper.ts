import type { WarehouseRow } from '../../../../../../infrastructure/warehouse';
import {
  type GroupedValuesPlan,
  Period,
  type PeriodGrain,
  parseCalendarDate,
  Reduction,
  resolveLatest,
  resolveSortKey,
  type SectionQueryPlan,
  type SortKeyType,
  type TableQueryPlan,
} from '../../../../domain';
import type {
  GroupedValues,
  SectionData,
  TableCell,
  TableRows,
} from '../../../../use-cases';
import { MappingError } from '../../../shared';
import {
  CATEGORY_ALIAS,
  cellColumnAlias,
  distinctCountAlias,
  PAGE_COUNT_ALIAS,
  PAGE_NUMBER_ALIAS,
  SORT_KEY_ALIAS,
  SORT_KEY_DISTINCT_COUNT_ALIAS,
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
        Period.parse(plan.grain, period) === null
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

function readGroupedPeriod(row: WarehouseRow, grain: PeriodGrain) {
  const period = row.period;
  if (typeof period !== 'string' || Period.parse(grain, period) === null) {
    throw new MappingError(
      `period must match ${grain} grain, received ${JSON.stringify(period)}`
    );
  }
  return period;
}

function readGroupedCategory(row: WarehouseRow) {
  const category = row[CATEGORY_ALIAS];
  if (category === null || typeof category === 'string') return category;
  throw new MappingError(
    `category must be a string or null, received ${JSON.stringify(category)}`
  );
}

function readGroupedSortKey(row: WarehouseRow, type: SortKeyType) {
  const sortKey = row[SORT_KEY_ALIAS];
  if (sortKey === null) return null;
  if (type === 'text' && typeof sortKey === 'string') return sortKey;
  if (
    type === 'number' &&
    typeof sortKey === 'number' &&
    Number.isFinite(sortKey)
  )
    return sortKey;
  throw new MappingError(
    `${SORT_KEY_ALIAS} must be ${type === 'text' ? 'a string' : 'a finite number'} or null, received ${JSON.stringify(sortKey)}`
  );
}

export function toGroupedValues(
  rows: WarehouseRow[],
  plan: GroupedValuesPlan
): GroupedValues | null {
  if (rows.length === 0) return null;
  if (plan.buckets === null && plan.category === null) {
    throw new Error('Grouped values require a period or category key');
  }
  const sortKeyPlan = plan.category?.sortKey ?? null;
  const mapped = rows.map((row) => {
    const period =
      plan.buckets === null ? '' : readGroupedPeriod(row, plan.buckets.grain);
    const category = plan.category === null ? null : readGroupedCategory(row);
    const values = plan.measures.map((measure, index) => {
      const value = readNullableNumber(row, valueColumnAlias(index));
      return measure.reduction === Reduction.LATEST
        ? resolveLatest(
            value,
            readDistinctCount(row, distinctCountAlias(index)),
            { sectionId: plan.sectionId, column: measure.column }
          )
        : value;
    });
    const sortKey =
      sortKeyPlan === null ? null : readGroupedSortKey(row, sortKeyPlan.type);
    return {
      period,
      category,
      values,
      sortKey,
      sortKeyDistinctCount:
        sortKeyPlan === null
          ? 0
          : readDistinctCount(row, SORT_KEY_DISTINCT_COUNT_ALIAS),
    };
  });
  if (plan.buckets === null) {
    if (plan.category === null)
      throw new Error('Grouped values require a category key');
    return {
      grouping: 'category',
      groups: mapped.map(
        ({ category, values, sortKey, sortKeyDistinctCount }) => ({
          category,
          values,
          ...(sortKeyPlan === null
            ? {}
            : {
                sortKey: resolveSortKey(sortKey, sortKeyDistinctCount, {
                  sectionId: plan.sectionId,
                  column: sortKeyPlan.column,
                }),
              }),
        })
      ),
    };
  }
  const periods = Array.from(new Set(mapped.map((row) => row.period)));
  const includedPeriods = periods.slice(0, plan.buckets.bucketLimit);
  const included = mapped.filter((row) => includedPeriods.includes(row.period));
  const buckets = [...includedPeriods].reverse().map((period) => ({
    period,
    cells: included.filter((row) => row.period === period),
  }));
  if (plan.category === null) {
    return {
      grouping: 'period',
      truncated: periods.length > plan.buckets.bucketLimit,
      buckets: buckets.map(({ period, cells }) => ({
        period,
        values: cells[0].values,
      })),
    };
  }
  return {
    grouping: 'period-category',
    truncated: periods.length > plan.buckets.bucketLimit,
    buckets: buckets.map(({ period, cells }) => ({
      period,
      cells: cells.map(({ category, values }) => ({ category, values })),
    })),
  };
}
