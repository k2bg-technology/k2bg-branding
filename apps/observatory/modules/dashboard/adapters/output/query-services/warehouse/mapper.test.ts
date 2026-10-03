import { describe, expect, it } from 'vitest';

import type { SectionQueryPlan, TableQueryPlan } from '../../../../domain';
import { AmbiguousLatestValueError, Period } from '../../../../domain';
import { MappingError } from '../../../shared';
import { toDateBounds, toSectionData, toTableRows } from './mapper';

function plan(): Extract<SectionQueryPlan, { kind: 'stat-tiles' }> {
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

describe('hour buckets', () => {
  const hourPlan: Extract<SectionQueryPlan, { kind: 'time-series' }> = {
    kind: 'time-series',
    sectionId: 'readings',
    grain: 'hour',
    firstHour: 0,
    source: {
      dataset: 'home',
      view: 'hourly_readings',
      time: { date: 'reading_date', hour: 'reading_hour' },
    },
    timeZone: 'Asia/Tokyo',
    selectedPeriod: '2026-08-15',
    dateRange: { firstDate: '2026-08-10', lastDate: '2026-08-15' },
    measures: [{ column: 'temperature', reduction: 'average' }],
    bucketLimit: 120,
  };

  it('maps valid hour keys with unchanged values', () => {
    expect(
      toSectionData([{ period: '2026-08-15T03', value_0: 21 }], hourPlan)
    ).toEqual({
      truncated: false,
      buckets: [{ period: '2026-08-15T03', values: [21] }],
    });
  });

  it.each([
    '2026-08-15T24',
    '2026-08-15T-1',
    '2026-08-15T1',
    '2026-02-30T03',
    '2026-08-15',
  ])('rejects malformed hour key %s', (period) => {
    expect(() => toSectionData([{ period, value_0: 1 }], hourPlan)).toThrow(
      new MappingError(`period must match hour grain, received "${period}"`)
    );
  });

  it('retains the newest 120 complete hour buckets in ascending order', () => {
    const rows = Array.from({ length: 121 }, (_, index) => {
      const instant = new Date(Date.UTC(2026, 7, 15, 23 - index));
      return {
        period: `${instant.toISOString().slice(0, 10)}T${String(instant.getUTCHours()).padStart(2, '0')}`,
        value_0: index,
      };
    });

    const result = toSectionData(rows, hourPlan);

    expect(result?.truncated).toBe(true);
    expect(result?.buckets).toHaveLength(120);
    expect(result?.buckets[0]).toEqual({
      period: '2026-08-11T00',
      values: [119],
    });
    expect(result?.buckets.at(-1)).toEqual({
      period: '2026-08-15T23',
      values: [0],
    });
    expect(toSectionData(rows.slice(0, 120), hourPlan)?.truncated).toBe(false);
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
