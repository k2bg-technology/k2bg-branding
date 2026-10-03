import { describe, expect, it } from 'vitest';

import { Period } from './period';
import { timeSeriesSpine } from './timeSeriesSpine';

describe('timeSeriesSpine', () => {
  it('keeps a reduced January average and draws an absent February as a gap', () => {
    const period = Period.parse('month', '2026-03');
    if (period === null) {
      throw new Error('Expected period to parse');
    }
    const reducedBuckets = [
      { period: '2026-01', values: [15] },
      { period: '2026-03', values: [30] },
    ];

    const result = timeSeriesSpine(period, 3, reducedBuckets, false);

    expect(
      result.map(({ period: month, values }) => ({
        period: month.toString(),
        value: values[0],
      }))
    ).toEqual([
      { period: '2026-01', value: 15 },
      { period: '2026-02', value: null },
      { period: '2026-03', value: 30 },
    ]);
  });

  it('starts a truncated range at the oldest returned bucket', () => {
    const period = Period.parse('month', '2026-03');
    if (period === null) {
      throw new Error('Expected period to parse');
    }

    const result = timeSeriesSpine(
      period,
      12,
      [
        { period: '2026-02', values: [20] },
        { period: '2026-03', values: [30] },
      ],
      true
    );

    expect(result.map(({ period: month }) => month.toString())).toEqual([
      '2026-02',
      '2026-03',
    ]);
  });

  it.each([
    {
      grain: 'week',
      selected: '2027-W01',
      first: '2026-W52',
      gap: '2026-W53',
    },
    {
      grain: 'day',
      selected: '2026-03-01',
      first: '2026-02-27',
      gap: '2026-02-28',
    },
  ] as const)(
    'draws the absent $gap as a gap in a $grain window through $selected',
    ({ grain, selected, first, gap }) => {
      const period = Period.parse(grain, selected);
      if (period === null) {
        throw new Error('Expected period to parse');
      }
      const buckets = [
        { period: first, values: [10] },
        { period: selected, values: [30] },
      ];

      const result = timeSeriesSpine(period, 3, buckets, false);

      expect(
        result.map(({ period: bucketPeriod, values }) => ({
          period: bucketPeriod.toString(),
          value: values[0],
        }))
      ).toEqual([
        { period: first, value: 10 },
        { period: gap, value: null },
        { period: selected, value: 30 },
      ]);
    }
  );

  it('starts a truncated week range at the oldest returned ISO week', () => {
    const period = Period.parse('week', '2027-W01');
    if (period === null) {
      throw new Error('Expected period to parse');
    }

    const result = timeSeriesSpine(
      period,
      5,
      [
        { period: '2026-W53', values: [20] },
        { period: '2027-W01', values: [30] },
      ],
      true
    );

    expect(result.map(({ period: week }) => week.toString())).toEqual([
      '2026-W53',
      '2027-W01',
    ]);
  });
});
