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
      scenario: 'a rising higher-is-better value',
      current: 120,
      previous: 100,
      direction: 'higher-is-better' as const,
      trend: 'up',
      sentiment: 'positive',
      absoluteChange: 20,
    },
    {
      scenario: 'a falling higher-is-better value',
      current: 80,
      previous: 100,
      direction: 'higher-is-better' as const,
      trend: 'down',
      sentiment: 'negative',
      absoluteChange: -20,
    },
    {
      scenario: 'a falling lower-is-better value',
      current: 80,
      previous: 100,
      direction: 'lower-is-better' as const,
      trend: 'down',
      sentiment: 'positive',
      absoluteChange: -20,
    },
    {
      scenario: 'a rising lower-is-better value',
      current: 120,
      previous: 100,
      direction: 'lower-is-better' as const,
      trend: 'up',
      sentiment: 'negative',
      absoluteChange: 20,
    },
    {
      scenario: 'an unchanged value',
      current: 100,
      previous: 100,
      direction: 'higher-is-better' as const,
      trend: 'flat',
      sentiment: null,
      absoluteChange: 0,
    },
    {
      scenario: 'a rising neutral value',
      current: 120,
      previous: 100,
      direction: 'neutral' as const,
      trend: 'up',
      sentiment: null,
      absoluteChange: 20,
    },
  ])(
    'reports the trend, sentiment, and absolute change for $scenario',
    ({ current, previous, direction, trend, sentiment, absoluteChange }) => {
      const sut = comparePreviousPeriod;

      const result = sut(current, previous, direction);

      expect(result).toMatchObject({
        trend,
        sentiment,
        absoluteChange,
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
