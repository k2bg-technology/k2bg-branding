import { describe, expect, it } from 'vitest';

import { comparePreviousPeriod } from './comparePreviousPeriod';

describe('comparePreviousPeriod', () => {
  it.each([
    { current: null, previous: 10 },
    { current: 12, previous: null },
  ])(
    'omits a delta when either month has no value',
    ({ current, previous }) => {
      expect(
        comparePreviousPeriod(current, previous, 'higher-is-better')
      ).toBeNull();
    }
  );

  it.each([
    {
      current: 120,
      previous: 100,
      direction: 'higher-is-better' as const,
      trend: 'up',
      sentiment: 'positive',
    },
    {
      current: 80,
      previous: 100,
      direction: 'higher-is-better' as const,
      trend: 'down',
      sentiment: 'negative',
    },
    {
      current: 80,
      previous: 100,
      direction: 'lower-is-better' as const,
      trend: 'down',
      sentiment: 'positive',
    },
    {
      current: 120,
      previous: 100,
      direction: 'lower-is-better' as const,
      trend: 'up',
      sentiment: 'negative',
    },
    {
      current: 100,
      previous: 100,
      direction: 'higher-is-better' as const,
      trend: 'flat',
      sentiment: null,
    },
    {
      current: 120,
      previous: 100,
      direction: 'neutral' as const,
      trend: 'up',
      sentiment: null,
    },
  ])(
    'returns $trend with $sentiment sentiment',
    ({ current, previous, direction, trend, sentiment }) => {
      const result = comparePreviousPeriod(current, previous, direction);

      expect(result).toMatchObject({
        trend,
        sentiment,
        absoluteChange: current - previous,
      });
    }
  );

  it.each([0, -10])(
    'omits relative change for previous value %i',
    (previous) => {
      const result = comparePreviousPeriod(10, previous, 'higher-is-better');

      expect(result?.relativeChange).toBeNull();
    }
  );
});
