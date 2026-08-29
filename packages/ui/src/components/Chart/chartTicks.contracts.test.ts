import { describe, expect, it } from 'vitest';

import { formatTimestamp, getTimeAxisTicks } from './chartTicks';
import { ChartPeriod } from './types';

const tokyo = 'Asia/Tokyo';
/** 15:00 UTC is midnight in Tokyo, the sharpest edge for a zone offset. */
const tokyoMidnight = Date.UTC(2026, 0, 14, 15);

function hourlyTimestamps(start: number, count: number): number[] {
  const oneHour = 60 * 60 * 1000;
  return Array.from({ length: count }, (_, index) => start + index * oneHour);
}

function tokyoHour(timestamp: number): number {
  return Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: tokyo,
      hourCycle: 'h23',
      hour: '2-digit',
    }).format(new Date(timestamp))
  );
}

describe('formatTimestamp', () => {
  it('reads the hour in the given time zone', () => {
    const result = formatTimestamp(tokyoMidnight, ChartPeriod.DAY, tokyo);

    expect(result).toBe('00:00');
  });

  it('reads the hour in UTC when no time zone is given', () => {
    const result = formatTimestamp(tokyoMidnight, ChartPeriod.DAY);

    expect(result).toBe('15:00');
  });

  it('reads the date in the given time zone across the UTC day boundary', () => {
    const result = formatTimestamp(tokyoMidnight, ChartPeriod.MONTH, tokyo);

    expect(result).toBe('1/15');
  });

  it('reads the date in UTC when no time zone is given', () => {
    const result = formatTimestamp(tokyoMidnight, ChartPeriod.MONTH);

    expect(result).toBe('1/14');
  });

  it.each`
    period                 | expected
    ${ChartPeriod.DAY}     | ${'15:00'}
    ${ChartPeriod.WEEK}    | ${'1/14'}
    ${ChartPeriod.MONTH}   | ${'1/14'}
    ${ChartPeriod.QUARTER} | ${'1/14'}
    ${ChartPeriod.YEAR}    | ${'2026/1'}
  `(
    'formats $period identically with an explicit UTC zone and without one',
    ({ period, expected }) => {
      const explicit = formatTimestamp(tokyoMidnight, period, 'UTC');
      const implicit = formatTimestamp(tokyoMidnight, period);

      expect(explicit).toBe(implicit);
      expect(implicit).toBe(expected);
    }
  );
});

describe('getTimeAxisTicks', () => {
  it('anchors day-boundary ticks to midnight in the given time zone', () => {
    const threeTokyoDays = hourlyTimestamps(tokyoMidnight, 72);

    const { ticks } = getTimeAxisTicks(
      threeTokyoDays,
      ChartPeriod.MONTH,
      tokyo
    );

    const tokyoMidnightHour = 0;
    const hours = ticks.map(tokyoHour);
    expect(hours.length).toBeGreaterThan(0);
    expect(hours.every((hour) => hour === tokyoMidnightHour)).toBe(true);
  });

  it('labels one tick per calendar day in the given time zone', () => {
    const threeTokyoDays = hourlyTimestamps(tokyoMidnight, 72);

    const { ticks, formatTick } = getTimeAxisTicks(
      threeTokyoDays,
      ChartPeriod.MONTH,
      tokyo
    );

    expect(ticks.map(formatTick)).toEqual(['1/15', '1/16', '1/17']);
  });

  it('picks the same ticks with an explicit UTC zone and without one', () => {
    const threeUtcDays = hourlyTimestamps(tokyoMidnight, 72);

    const explicit = getTimeAxisTicks(threeUtcDays, ChartPeriod.MONTH, 'UTC');
    const implicit = getTimeAxisTicks(threeUtcDays, ChartPeriod.MONTH);

    expect(implicit.ticks).toEqual(explicit.ticks);
    expect(implicit.ticks.map(implicit.formatTick)).toEqual(
      explicit.ticks.map(explicit.formatTick)
    );
  });
});
