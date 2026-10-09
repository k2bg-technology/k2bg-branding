import { describe, expect, it } from 'vitest';

import type {
  GroupedValuesPlan,
  SectionQueryPlan,
  TableQueryPlan,
} from '../../../../domain';
import {
  AmbiguousLatestValueError,
  AmbiguousSortKeyError,
  Period,
} from '../../../../domain';
import { MappingError } from '../../../shared';
import {
  toDateBounds,
  toGroupedValues,
  toSectionData,
  toTableRows,
} from './mapper';

function plan(): SectionQueryPlan {
  return {
    kind: 'stat-tiles',
    sectionId: 'headline',
    grain: 'month',
    source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
    timeZone: 'UTC',
    selectedPeriod: '2026-08',
    dateRange: { firstDate: '2026-07-01', lastDate: '2026-08-31' },
    measures: [
      { column: 'total', reduction: 'sum', compares: true },
      { column: 'status', reduction: 'latest', compares: false },
    ],
  };
}

describe('warehouse dashboard mapper', () => {
  it('returns null when no month has a bucket', () => {
    expect(toSectionData([], plan())).toBeNull();
  });

  it('keeps selected and previous values in separate monthly buckets', () => {
    const result = toSectionData(
      [
        { period: '2026-07', value_0: 100, value_1: 8, distinct_count_1: 2 },
        { period: '2026-08', value_0: 120, value_1: 9, distinct_count_1: 1 },
      ],
      plan()
    );

    expect(result).toEqual({
      truncated: false,
      buckets: [
        { period: '2026-07', values: [100, null] },
        { period: '2026-08', values: [120, 9] },
      ],
    });
  });

  it('preserves null for an all-null selected measure', () => {
    const result = toSectionData(
      [
        {
          period: '2026-08',
          value_0: null,
          value_1: null,
          distinct_count_1: 1,
        },
      ],
      plan()
    );

    expect(result?.buckets[0].values).toEqual([null, null]);
  });

  it('throws when selected latest rows have different values at the greatest source time', () => {
    const action = () =>
      toSectionData(
        [
          {
            period: '2026-08',
            value_0: 10,
            value_1: null,
            distinct_count_1: 2,
          },
        ],
        plan()
      );

    expect(action).toThrow(AmbiguousLatestValueError);
  });

  it('checks a comparing latest value in the previous bucket', () => {
    const comparing = plan();
    if (comparing.kind === 'stat-tiles') {
      comparing.measures[1].compares = true;
    }

    const action = () =>
      toSectionData(
        [
          {
            period: '2026-07',
            value_0: 10,
            value_1: null,
            distinct_count_1: 2,
          },
        ],
        comparing
      );

    expect(action).toThrow(AmbiguousLatestValueError);
  });

  it('throws MappingError when a bucket period is not a calendar month', () => {
    const action = () =>
      toSectionData(
        [
          {
            period: '2026-13',
            value_0: 120,
            value_1: 9,
            distinct_count_1: 1,
          },
        ],
        plan()
      );

    expect(action).toThrow(MappingError);
  });

  it('maps formatted bounds while preserving calendar dates', () => {
    const result = toDateBounds([
      { first_date: '2026-08-01', last_date: '2026-09-30' },
    ]);

    expect(result).toEqual({ firstDate: '2026-08-01', lastDate: '2026-09-30' });
  });

  it('drops the oldest bucket beyond the cap and keeps the newest complete bucket', () => {
    const timeSeriesPlan: SectionQueryPlan = {
      ...plan(),
      kind: 'time-series',
      measures: [{ column: 'total', reduction: 'sum' }],
      bucketLimit: 120,
    };
    const selected = Period.parse('month', '2026-08');
    if (selected === null) {
      throw new Error('Expected selected period to parse');
    }
    const rows = Array.from({ length: 121 }, (_, index) => ({
      period: selected.shift(-index).toString(),
      value_0: 121 - index,
    }));

    const result = toSectionData(rows, timeSeriesPlan);

    expect(result?.truncated).toBe(true);
    expect(result?.buckets).toHaveLength(120);
    expect(result?.buckets[0]).toEqual({
      period: selected.shift(-119).toString(),
      values: [2],
    });
    expect(result?.buckets.at(-1)).toEqual({
      period: '2026-08',
      values: [121],
    });
    expect(toSectionData(rows.slice(0, 120), timeSeriesPlan)?.truncated).toBe(
      false
    );
  });

  it('rejects an ambiguous latest value in any displayed time-series bucket', () => {
    const timeSeriesPlan: SectionQueryPlan = {
      ...plan(),
      kind: 'time-series',
      measures: [{ column: 'status', reduction: 'latest' }],
      bucketLimit: 120,
    };

    expect(() =>
      toSectionData(
        [
          { period: '2026-08', value_0: 9, distinct_count_0: 1 },
          { period: '2026-07', value_0: 7, distinct_count_0: 2 },
        ],
        timeSeriesPlan
      )
    ).toThrow(AmbiguousLatestValueError);
  });

  it.each([
    { grain: 'week', key: '2026-08-01' },
    { grain: 'day', key: '2026-W31' },
  ] as const)('rejects a $grain plan with bucket $key', ({ grain, key }) => {
    const queryPlan = { ...plan(), grain, selectedPeriod: key };

    expect(() =>
      toSectionData(
        [{ period: key, value_0: 5, value_1: null, distinct_count_1: 1 }],
        queryPlan
      )
    ).toThrow(MappingError);
  });

  it.each([
    { grain: 'week', key: '2026-W31' },
    { grain: 'day', key: '2026-08-15' },
  ] as const)('maps a $grain bucket $key', ({ grain, key }) => {
    const queryPlan = { ...plan(), grain, selectedPeriod: key };

    const result = toSectionData(
      [{ period: key, value_0: 5, value_1: 9, distinct_count_1: 1 }],
      queryPlan
    );

    expect(result?.buckets).toEqual([{ period: key, values: [5, 9] }]);
  });
});

const pagedTablePlan: TableQueryPlan = {
  sectionId: 'detail',
  source: { dataset: 'metrics', view: 'entries', time: 'recorded_on' },
  timeZone: 'UTC',
  dateRange: { firstDate: '2026-08-01', lastDate: '2026-08-31' },
  columns: [
    { column: 'date', type: 'date' },
    { column: 'description', type: 'text' },
    { column: 'amount', type: 'number' },
  ],
  sort: null,
  rows: { pageSize: 20, page: 3 },
};

describe('toTableRows', () => {
  const warehouseRow = {
    cell_0: '2026-08-15',
    cell_1: 'Rent',
    cell_2: 120000,
    page_number: 3,
    page_count: 3,
  };

  it('maps a page with one cell per declared column', () => {
    expect(toTableRows([warehouseRow], pagedTablePlan)).toEqual({
      rows: [['2026-08-15', 'Rent', 120000]],
      page: { number: 3, count: 3 },
    });
  });

  it('maps a limit table without page metadata', () => {
    const plan = { ...pagedTablePlan, rows: { limit: 10 } };
    expect(toTableRows([warehouseRow], plan)).toEqual({
      rows: [['2026-08-15', 'Rent', 120000]],
      page: null,
    });
  });

  it('returns null for no rows', () => {
    expect(toTableRows([], pagedTablePlan)).toBeNull();
  });

  it.each([
    { name: 'text number', row: { ...warehouseRow, cell_1: 5 } },
    { name: 'invalid date', row: { ...warehouseRow, cell_0: '2026-13-01' } },
    { name: 'zero page', row: { ...warehouseRow, page_number: 0 } },
    { name: 'page beyond count', row: { ...warehouseRow, page_number: 4 } },
  ])('rejects $name', ({ row }) => {
    expect(() => toTableRows([row], pagedTablePlan)).toThrow(MappingError);
  });

  it('rejects an invalid timestamp cell', () => {
    const plan = {
      ...pagedTablePlan,
      columns: [{ column: 'recorded_at', type: 'timestamp' as const }],
    };
    expect(() =>
      toTableRows([{ cell_0: 'x', page_number: 1, page_count: 1 }], plan)
    ).toThrow(MappingError);
  });
});

function groupedPlan(): GroupedValuesPlan {
  return {
    sectionId: 'bars',
    source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
    timeZone: 'UTC',
    dateRange: { firstDate: '2026-01-01', lastDate: '2026-08-31' },
    measures: [{ column: 'amount', reduction: 'sum' }],
    buckets: { grain: 'month', bucketLimit: 120 },
    category: { column: 'category', sortKey: null },
  };
}

describe('toGroupedValues', () => {
  it('preserves NULL categories and groups pivot cells oldest first', () => {
    expect(
      toGroupedValues(
        [
          { period: '2026-08', category: 'food', value_0: 300 },
          { period: '2026-08', category: null, value_0: 20 },
          { period: '2026-07', category: 'food', value_0: 100 },
        ],
        groupedPlan()
      )
    ).toEqual({
      grouping: 'period-category',
      truncated: false,
      buckets: [
        { period: '2026-07', cells: [{ category: 'food', values: [100] }] },
        {
          period: '2026-08',
          cells: [
            { category: 'food', values: [300] },
            { category: null, values: [20] },
          ],
        },
      ],
    });
    expect(toGroupedValues([], groupedPlan())).toBeNull();
  });

  it('caps distinct periods rather than rows', () => {
    const periods = Array.from({ length: 121 }, (_, index) =>
      Period.parse('month', '2026-08')?.shift(-index).toString()
    );
    const rows = periods.flatMap((period) => [
      { period, category: 'A', value_0: 1 },
      { period, category: 'B', value_0: 2 },
    ]);
    const result = toGroupedValues(rows, groupedPlan());
    expect(result?.grouping).toBe('period-category');
    if (result?.grouping !== 'period-category')
      throw new Error('Expected pivot groups');
    expect(result.truncated).toBe(true);
    expect(result.buckets).toHaveLength(120);
    expect(result.buckets[0].period).toBe(periods[119]);
    expect(result.buckets[0].cells).toHaveLength(2);
  });

  it('validates sort key ambiguity and row values', () => {
    const plan = {
      ...groupedPlan(),
      buckets: null,
      category: {
        column: 'category',
        sortKey: { column: 'weekday', type: 'number' as const },
      },
    };
    expect(
      toGroupedValues(
        [
          {
            category: 'Mon',
            value_0: 3,
            sort_key: 2,
            sort_key_distinct_count: 1,
          },
        ],
        plan
      )
    ).toEqual({
      grouping: 'category',
      groups: [{ category: 'Mon', values: [3], sortKey: 2 }],
    });
    expect(() =>
      toGroupedValues(
        [
          {
            category: 'Mon',
            value_0: 3,
            sort_key: 2,
            sort_key_distinct_count: 2,
          },
        ],
        plan
      )
    ).toThrow(AmbiguousSortKeyError);
    expect(() =>
      toGroupedValues(
        [{ category: 5, value_0: 3, sort_key: 2, sort_key_distinct_count: 1 }],
        plan
      )
    ).toThrow(MappingError);
    expect(() =>
      toGroupedValues(
        [
          {
            category: 'Mon',
            value_0: 3,
            sort_key: 'x',
            sort_key_distinct_count: 1,
          },
        ],
        plan
      )
    ).toThrow(MappingError);
  });

  it('rejects ambiguous latest values', () => {
    const plan = {
      ...groupedPlan(),
      measures: [{ column: 'balance', reduction: 'latest' as const }],
    };
    expect(() =>
      toGroupedValues(
        [
          {
            period: '2026-08',
            category: null,
            value_0: 3,
            distinct_count_0: 2,
          },
        ],
        plan
      )
    ).toThrow(AmbiguousLatestValueError);
  });
});
