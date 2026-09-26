import { describe, expect, it } from 'vitest';

import type { SectionQueryPlan } from '../../../../domain';
import { AmbiguousLatestValueError } from '../../../../domain';
import { MappingError } from '../../../shared';
import { toDateBounds, toSectionData } from './mapper';

function plan(): SectionQueryPlan {
  return {
    kind: 'stat-tiles',
    sectionId: 'headline',
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
    comparing.measures[1].compares = true;

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
});
