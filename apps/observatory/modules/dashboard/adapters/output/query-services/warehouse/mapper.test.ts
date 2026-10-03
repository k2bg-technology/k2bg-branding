import { describe, expect, it } from 'vitest';

import type { SectionQueryPlan } from '../../../../domain';
import { AmbiguousLatestValueError, Period } from '../../../../domain';
import { MappingError } from '../../../shared';
import { toDateBounds, toSectionData } from './mapper';

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
