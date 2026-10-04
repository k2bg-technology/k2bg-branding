import { describe, expect, it } from 'vitest';

import { Period } from './period';
import { resolveSectionRange } from './sectionRange';
import { timeSeriesSpine } from './timeSeriesSpine';

function selected(grain: 'month' | 'week' | 'day', key: string) {
  const period = Period.parse(grain, key);
  if (period === null) {
    throw new Error('Expected period to parse');
  }
  return period;
}

describe('timeSeriesSpine', () => {
  it('preserves values and fills an absent month', () => {
    const range = resolveSectionRange(
      { window: 3 },
      selected('month', '2026-03')
    );

    const result = timeSeriesSpine(
      range,
      [
        { period: '2026-01', values: [15] },
        { period: '2026-03', values: [30] },
      ],
      1,
      'UTC'
    );

    expect(
      result.map(({ period, values }) => ({ period, value: values[0] }))
    ).toEqual([
      { period: '2026-01', value: 15 },
      { period: '2026-02', value: null },
      { period: '2026-03', value: 30 },
    ]);
  });

  it.each([
    {
      grain: 'week',
      selectedKey: '2027-W01',
      first: '2026-W52',
      gap: '2026-W53',
    },
    {
      grain: 'day',
      selectedKey: '2026-03-01',
      first: '2026-02-27',
      gap: '2026-02-28',
    },
  ] as const)(
    'fills a $grain gap across a calendar boundary',
    ({ grain, selectedKey, first, gap }) => {
      const range = resolveSectionRange(
        { window: 3 },
        selected(grain, selectedKey)
      );

      const result = timeSeriesSpine(
        range,
        [
          { period: first, values: [10] },
          { period: selectedKey, values: [30] },
        ],
        1,
        'UTC'
      );

      expect(result.map(({ period }) => period)).toEqual([
        first,
        gap,
        selectedKey,
      ]);
      expect(result[1].values).toEqual([null]);
    }
  );

  it('starts at a retained truncated bucket and fills the trailing gap', () => {
    const range = resolveSectionRange(
      { window: 12 },
      selected('month', '2026-03'),
      { truncated: true, firstBucket: '2026-02' }
    );

    const result = timeSeriesSpine(
      range,
      [{ period: '2026-02', values: [20] }],
      1,
      'UTC'
    );

    expect(result.map(({ period, values }) => [period, values[0]])).toEqual([
      ['2026-02', 20],
      ['2026-03', null],
    ]);
  });

  it('fills leading, middle, and trailing days across January through April', () => {
    const range = resolveSectionRange(
      { grain: 'day', window: 120 },
      selected('month', '2026-04')
    );

    const result = timeSeriesSpine(
      range,
      [
        { period: '2026-01-10', values: [10] },
        { period: '2026-04-20', values: [20] },
      ],
      1,
      'UTC'
    );

    expect(result).toHaveLength(120);
    expect(result[0]).toMatchObject({ period: '2026-01-01', values: [null] });
    expect(
      result.find(({ period }) => period === '2026-01-10')?.values
    ).toEqual([10]);
    expect(
      result.find(({ period }) => period === '2026-02-01')?.values
    ).toEqual([null]);
    expect(
      result.find(({ period }) => period === '2026-03-31')?.values
    ).toEqual([null]);
    expect(
      result.find(({ period }) => period === '2026-04-20')?.values
    ).toEqual([20]);
    expect(result.at(-1)).toMatchObject({
      period: '2026-04-30',
      values: [null],
    });
  });

  it('omits a spring hour without shifting the next measured value', () => {
    const range = resolveSectionRange(
      { grain: 'hour' },
      selected('day', '2026-03-08')
    );

    const result = timeSeriesSpine(
      range,
      [
        { period: '2026-03-08T02', values: [2] },
        { period: '2026-03-08T03', values: [3] },
      ],
      1,
      'America/New_York'
    );

    expect(result).toHaveLength(23);
    expect(result.some(({ period }) => period === '2026-03-08T02')).toBe(false);
    expect(result.find(({ period }) => period === '2026-03-08T03')).toEqual({
      period: '2026-03-08T03',
      timestamp: 1772953200000,
      values: [3],
    });
  });

  it('uses the earlier fall hour once', () => {
    const range = resolveSectionRange(
      { grain: 'hour' },
      selected('day', '2026-11-01')
    );

    const result = timeSeriesSpine(
      range,
      [{ period: '2026-11-01T01', values: [1] }],
      1,
      'America/New_York'
    );

    expect(result.filter(({ period }) => period === '2026-11-01T01')).toEqual([
      { period: '2026-11-01T01', timestamp: 1793509200000, values: [1] },
    ]);
  });

  it('starts a truncated hour range at a retained nonzero hour', () => {
    const range = resolveSectionRange(
      { grain: 'hour', window: 30 },
      selected('day', '2026-08-15'),
      { truncated: true, firstBucket: '2026-08-15T03' }
    );

    const result = timeSeriesSpine(
      range,
      [{ period: '2026-08-15T03', values: [3] }],
      1,
      'Asia/Tokyo'
    );

    expect(result[0]).toMatchObject({ period: '2026-08-15T03', values: [3] });
    expect(result.at(-1)).toMatchObject({
      period: '2026-08-15T23',
      values: [null],
    });
    expect(result).toHaveLength(21);
  });
});
