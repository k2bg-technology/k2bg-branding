import { describe, expect, it } from 'vitest';

import type { SeriesSlot } from '../query-plan';
import {
  deriveLineSeries,
  firstMeasured,
  movingAverage,
  rebase,
  runningAverage,
  runningSum,
} from './deriveSeries';

const slot: Extract<SeriesSlot, { kind: 'line' }> = {
  kind: 'line',
  id: 'series-0',
  label: 'Total',
  valueIndex: 0,
  movingAverage: { window: 2, label: 'Smoothed', minimumPoints: 1 },
  running: { kind: 'sum', label: 'To date' },
};

describe('derived series', () => {
  it.each([
    {
      values: [1, 2, 3, 4],
      window: 3,
      minimumPoints: 3,
      expected: [null, null, 2, 3],
    },
    {
      values: [1, 2, 3, 4],
      window: 3,
      minimumPoints: 2,
      expected: [null, 1.5, 2, 3],
    },
    {
      values: [1, null, 3, 5],
      window: 3,
      minimumPoints: 2,
      expected: [null, null, 2, 4],
    },
    { values: [2, 4], window: 5, minimumPoints: 1, expected: [2, 3] },
    { values: [2, 4], window: 5, minimumPoints: 5, expected: [null, null] },
  ])(
    'averages trailing $window buckets with at least $minimumPoints measurements',
    ({ values, window, minimumPoints, expected }) => {
      const sut = movingAverage;

      const result = sut(values, window, minimumPoints);

      expect(result).toEqual(expected);
    }
  );

  it('warms up the first displayed average with three earlier values', () => {
    const sut = movingAverage;

    const result = sut([10, 20, 30, 40], 4, 4).slice(3);

    expect(result).toEqual([25]);
  });

  it.each([
    { values: [1, 2, 3], expected: [1, 3, 6] },
    { values: [1, null, 3], expected: [1, 1, 4] },
    { values: [null, 2, null, 3], expected: [null, 2, 2, 5] },
    { values: [null, null], expected: [null, null] },
  ])(
    'carries the total through missing buckets in $values',
    ({ values, expected }) => {
      const sut = runningSum;

      const result = sut(values);

      expect(result).toEqual(expected);
    }
  );

  it.each([
    { values: [2, 4, null, 6], expected: [2, 3, 3, 4] },
    { values: [null, 10, 20], expected: [null, 10, 15] },
  ])(
    'excludes missing buckets from the running average of $values',
    ({ values, expected }) => {
      const sut = runningAverage;

      const result = sut(values);

      expect(result).toEqual(expected);
    }
  );

  it.each([
    { values: [100, 120, 90], base: 80, expected: [125, 150, 112.5] },
    { values: [80, null, 100], base: 80, expected: [100, null, 125] },
    { values: [100, 120], base: 0, expected: [null, null] },
    { values: [100, 120], base: null, expected: [null, null] },
    { values: [100, 120], base: Number.NaN, expected: [null, null] },
  ])(
    'indexes $values to $base and preserves missing values',
    ({ values, base, expected }) => {
      const sut = rebase;

      const result = sut(values, base);

      expect(result).toEqual(expected);
    }
  );

  it.each([
    { values: [null, 80, 100], expected: 80 },
    { values: [null], expected: null },
  ])('finds the first measured value of $values', ({ values, expected }) => {
    const sut = firstMeasured;

    const result = sut(values);

    expect(result).toBe(expected);
  });

  it('computes a moving average and a running total from the same source and restarts the total at the displayed window', () => {
    const sut = deriveLineSeries;

    const result = sut(slot, [10, 20, null, 40], 1, false);

    expect(result).toEqual([
      {
        id: 'series-0',
        label: 'Total',
        overlay: false,
        values: [20, null, 40],
      },
      {
        id: 'series-0-moving-average',
        label: 'Smoothed',
        overlay: true,
        values: [15, 20, 40],
      },
      {
        id: 'series-0-running',
        label: 'To date',
        overlay: true,
        values: [20, 20, 60],
      },
    ]);
  });

  it("divides an overlay by its source's first value", () => {
    const sut = deriveLineSeries;

    const result = sut(
      { ...slot, running: undefined, rebase: { base: 'first' } },
      [null, 80, 100],
      0,
      false
    );

    expect(result).toEqual([
      {
        id: 'series-0',
        label: 'Total',
        overlay: false,
        values: [null, 100, 125],
      },
      {
        id: 'series-0-moving-average',
        label: 'Smoothed',
        overlay: true,
        values: [null, 100, 112.5],
      },
    ]);
  });

  it.each([
    { name: 'a fixed base', value: 80, expected: [125, 150] },
    { name: 'a missing base', value: null, expected: [null, null] },
  ])('divides by $name', ({ value, expected }) => {
    const sut = deriveLineSeries;

    const result = sut(
      {
        ...slot,
        movingAverage: undefined,
        running: undefined,
        rebase: { base: 'fixed', value },
      },
      [100, 120],
      0,
      false
    );

    expect(result).toEqual([
      { id: 'series-0', label: 'Total', overlay: false, values: expected },
    ]);
  });

  it('draws only the stacked running total', () => {
    const sut = deriveLineSeries;

    const result = sut(
      {
        ...slot,
        id: 'category-0',
        movingAverage: undefined,
        running: { kind: 'sum', label: 'rent to date' },
      },
      [20, null, 30],
      0,
      true
    );

    expect(result).toEqual([
      {
        id: 'category-0-running',
        label: 'rent to date',
        overlay: false,
        values: [20, 20, 50],
      },
    ]);
  });
});
