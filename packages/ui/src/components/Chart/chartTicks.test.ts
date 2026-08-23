import { describe, expect, it } from 'vitest';

import {
  defaultValueFormatter,
  formatTimestamp,
  getTimeAxisTicks,
} from './chartTicks';
import { ChartPeriod } from './types';

function dailyTimestamps(count: number): number[] {
  return Array.from({ length: count }, (_, index) =>
    Date.UTC(2026, 0, 1 + index)
  );
}

describe('formatTimestamp', () => {
  const timestamp = Date.UTC(2026, 2, 7, 9, 5);

  it.each`
    period                 | expected
    ${ChartPeriod.DAY}     | ${'09:05'}
    ${ChartPeriod.WEEK}    | ${'3/7'}
    ${ChartPeriod.MONTH}   | ${'3/7'}
    ${ChartPeriod.QUARTER} | ${'3/7'}
    ${ChartPeriod.YEAR}    | ${'2026/3'}
  `('formats $period ticks as $expected', ({ period, expected }) => {
    const result = formatTimestamp(timestamp, period);

    expect(result).toBe(expected);
  });

  it('formats in UTC regardless of the local timezone', () => {
    const lastMinuteOfUtcDay = Date.UTC(2026, 0, 31, 23, 59);

    const result = formatTimestamp(lastMinuteOfUtcDay, ChartPeriod.DAY);

    expect(result).toBe('23:59');
  });
});

describe('getTimeAxisTicks', () => {
  it.each`
    period                 | pointCount | expectedTickCount
    ${ChartPeriod.DAY}     | ${24}      | ${6}
    ${ChartPeriod.WEEK}    | ${7}       | ${7}
    ${ChartPeriod.MONTH}   | ${30}      | ${6}
    ${ChartPeriod.QUARTER} | ${90}      | ${4}
    ${ChartPeriod.YEAR}    | ${12}      | ${6}
  `(
    'thins $pointCount points down to $expectedTickCount ticks for $period',
    ({ period, pointCount, expectedTickCount }) => {
      const timestamps = dailyTimestamps(pointCount);

      const { ticks } = getTimeAxisTicks(timestamps, period);

      expect(ticks).toHaveLength(expectedTickCount);
    }
  );

  it('keeps every point when there are fewer points than the target', () => {
    const timestamps = dailyTimestamps(3);

    const { ticks } = getTimeAxisTicks(timestamps, ChartPeriod.MONTH);

    expect(ticks).toEqual(timestamps);
  });

  it('deduplicates and sorts the timestamps before picking ticks', () => {
    const [first, second, third] = dailyTimestamps(3);

    const { ticks } = getTimeAxisTicks(
      [third, first, second, first],
      ChartPeriod.MONTH
    );

    expect(ticks).toEqual([first, second, third]);
  });

  it('always starts the ticks from the earliest timestamp', () => {
    const timestamps = dailyTimestamps(30);

    const { ticks } = getTimeAxisTicks(timestamps, ChartPeriod.MONTH);

    expect(ticks[0]).toBe(timestamps[0]);
  });

  it('returns an empty tick list for no timestamps', () => {
    const { ticks } = getTimeAxisTicks([], ChartPeriod.MONTH);

    expect(ticks).toEqual([]);
  });

  it('formats ticks with the period format', () => {
    const timestamp = Date.UTC(2026, 4, 20);

    const { formatTick } = getTimeAxisTicks([timestamp], ChartPeriod.YEAR);

    expect(formatTick(timestamp)).toBe('2026/5');
  });
});

describe('defaultValueFormatter', () => {
  it.each`
    value   | expected
    ${0}    | ${'0'}
    ${12.5} | ${'12.5'}
    ${-3}   | ${'-3'}
    ${1e6}  | ${'1000000'}
  `('renders $value as $expected', ({ value, expected }) => {
    const result = defaultValueFormatter(value);

    expect(result).toBe(expected);
  });
});
