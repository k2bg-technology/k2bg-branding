import { describe, expect, it } from 'vitest';

import { Period } from './period';
import { timeSeriesSpine } from './timeSeriesSpine';

describe('timeSeriesSpine', () => {
  it('keeps a reduced January average and draws an absent February as a gap', () => {
    const period = Period.parse('2026-03');
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
    const period = Period.parse('2026-03');
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
});
