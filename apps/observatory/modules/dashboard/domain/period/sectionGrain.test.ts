import { describe, expect, it } from 'vitest';

import { shiftBucketStart } from './sectionGrain';

describe('bucket shifts', () => {
  it.each([
    {
      grain: 'hour',
      start: { date: '2026-08-15', hour: 0 },
      expected: { date: '2026-08-14', hour: 22 },
    },
    {
      grain: 'month',
      start: { date: '2026-08-01', hour: 0 },
      expected: { date: '2026-06-01', hour: 0 },
    },
  ] as const)(
    'shifts $grain buckets across a date boundary',
    ({ grain, start, expected }) => {
      const sut = shiftBucketStart;

      const result = sut(grain, start, -2);

      expect(result).toEqual(expected);
    }
  );
});
