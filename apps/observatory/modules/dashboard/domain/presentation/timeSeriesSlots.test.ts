import { describe, expect, it } from 'vitest';

import type { TimeSeriesSeriesDefinition } from '../definition';
import {
  pivotBaseBucket,
  pivotSeriesSlots,
  wideSeriesSlots,
} from './timeSeriesSlots';

const series: TimeSeriesSeriesDefinition[] = [
  {
    label: 'A',
    column: 'a',
    reduction: 'sum',
    normalize: { kind: 'rebase', base: { date: '2026-01-31' } },
  },
  { label: 'R', low: 'lo', high: 'hi', reduction: 'maximum' },
];

describe('time-series slots', () => {
  it('attaches a fixed base at the line measure index and leaves bands unchanged', () => {
    const sut = wideSeriesSlots;

    const result = sut(series, { layout: 'wide', values: [80, null, null] });

    expect(result[0]).toMatchObject({
      id: 'series-0',
      rebase: { base: 'fixed', value: 80 },
    });
    expect(result[1]).toMatchObject({ kind: 'band' });
    expect(result[1]).not.toHaveProperty('rebase');
  });

  it('marks a missing fixed base as null', () => {
    const sut = wideSeriesSlots;

    const result = sut(series, null);

    expect(result[0]).toMatchObject({ rebase: { base: 'fixed', value: null } });
  });

  it('selects the first displayed measurement as the default base', () => {
    const sut = wideSeriesSlots;

    const result = sut(
      [
        {
          label: 'A',
          column: 'a',
          reduction: 'sum',
          normalize: { kind: 'rebase' },
        },
      ],
      undefined
    );

    expect(result[0]).toMatchObject({ rebase: { base: 'first' } });
  });

  it('attaches templated labels and folded fixed bases to pivot slots', () => {
    const sut = pivotSeriesSlots;

    const result = sut(
      {
        column: 'category',
        value: { column: 'amount', reduction: 'sum' },
        running: { kind: 'sum', label: '{category} to date' },
        normalize: { kind: 'rebase', base: { date: '2025-11-30' } },
      },
      {
        status: 'ready',
        series: [
          { id: 'category-0', label: 'rent' },
          { id: 'remainder', label: 'Other' },
        ],
        buckets: [],
        baseValues: [50, 10],
      }
    );

    expect(result).toEqual([
      {
        kind: 'line',
        id: 'category-0',
        label: 'rent',
        interpolation: undefined,
        valueIndex: 0,
        movingAverage: undefined,
        running: { kind: 'sum', label: 'rent to date' },
        rebase: { base: 'fixed', value: 50 },
      },
      {
        kind: 'line',
        id: 'remainder',
        label: 'Other',
        interpolation: undefined,
        valueIndex: 1,
        movingAverage: undefined,
        running: { kind: 'sum', label: 'Other to date' },
        rebase: { base: 'fixed', value: 10 },
      },
    ]);
  });

  it('rejects a wide base when reading pivot buckets', () => {
    const sut = pivotBaseBucket;

    expect(() => sut({ layout: 'wide', values: [80] })).toThrow(
      'A pivot section reads a pivot base'
    );
  });
});
