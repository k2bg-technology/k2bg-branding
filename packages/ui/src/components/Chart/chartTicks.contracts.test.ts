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

function dailyTimestamps(start: number, count: number): number[] {
  const oneDay = 24 * 60 * 60 * 1000;
  return Array.from({ length: count }, (_, index) => start + index * oneDay);
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

describe('getTimeAxisTicks headings', () => {
  const hourlyOverOneDay = hourlyTimestamps(tokyoMidnight, 24);
  const hourlyOverThreeDays = hourlyTimestamps(tokyoMidnight, 72);
  const dailyOverThreeDays = dailyTimestamps(tokyoMidnight, 3);
  const monthlyOverOneYear = Array.from({ length: 12 }, (_, index) =>
    Date.UTC(2026, index, 14, 15)
  );
  const afternoon = tokyoMidnight + 15 * 60 * 60 * 1000;

  it.each`
    sampling                 | timestamps             | period                 | expected
    ${'hourly over a day'}   | ${hourlyOverOneDay}    | ${ChartPeriod.DAY}     | ${'15:00'}
    ${'hourly over a day'}   | ${hourlyOverOneDay}    | ${ChartPeriod.WEEK}    | ${'15:00'}
    ${'hourly over a day'}   | ${hourlyOverOneDay}    | ${ChartPeriod.MONTH}   | ${'15:00'}
    ${'hourly over a day'}   | ${hourlyOverOneDay}    | ${ChartPeriod.QUARTER} | ${'15:00'}
    ${'hourly over a day'}   | ${hourlyOverOneDay}    | ${ChartPeriod.YEAR}    | ${'15:00'}
    ${'hourly over 3 days'}  | ${hourlyOverThreeDays} | ${ChartPeriod.DAY}     | ${'1/15 15:00'}
    ${'hourly over 3 days'}  | ${hourlyOverThreeDays} | ${ChartPeriod.WEEK}    | ${'1/15 15:00'}
    ${'hourly over 3 days'}  | ${hourlyOverThreeDays} | ${ChartPeriod.MONTH}   | ${'1/15 15:00'}
    ${'hourly over 3 days'}  | ${hourlyOverThreeDays} | ${ChartPeriod.QUARTER} | ${'1/15 15:00'}
    ${'hourly over 3 days'}  | ${hourlyOverThreeDays} | ${ChartPeriod.YEAR}    | ${'1/15 15:00'}
    ${'daily over 3 days'}   | ${dailyOverThreeDays}  | ${ChartPeriod.WEEK}    | ${'1/15'}
    ${'daily over 3 days'}   | ${dailyOverThreeDays}  | ${ChartPeriod.MONTH}   | ${'1/15'}
    ${'daily over 3 days'}   | ${dailyOverThreeDays}  | ${ChartPeriod.QUARTER} | ${'1/15'}
    ${'daily over 3 days'}   | ${dailyOverThreeDays}  | ${ChartPeriod.YEAR}    | ${'2026/1'}
    ${'monthly over a year'} | ${monthlyOverOneYear}  | ${ChartPeriod.YEAR}    | ${'2026/1'}
    ${'monthly over a year'} | ${monthlyOverOneYear}  | ${ChartPeriod.MONTH}   | ${'1/15'}
  `(
    'heads $sampling readings under $period with $expected',
    ({ timestamps, period, expected }) => {
      const { formatHeading } = getTimeAxisTicks(timestamps, period, tokyo);

      expect(formatHeading(afternoon)).toBe(expected);
    }
  );

  it.each`
    sampling               | timestamps            | period
    ${'hourly over a day'} | ${hourlyOverOneDay}   | ${ChartPeriod.DAY}
    ${'daily over 3 days'} | ${dailyOverThreeDays} | ${ChartPeriod.MONTH}
    ${'daily over 3 days'} | ${dailyOverThreeDays} | ${ChartPeriod.YEAR}
  `(
    'heads $sampling readings under $period exactly like its ticks',
    ({ timestamps, period }) => {
      const { formatTick, formatHeading } = getTimeAxisTicks(
        timestamps,
        period,
        tokyo
      );

      expect(formatHeading(afternoon)).toBe(formatTick(afternoon));
    }
  );

  it('dates a heading without pulling the coarse ticks along with it', () => {
    const { ticks, formatTick, formatHeading } = getTimeAxisTicks(
      hourlyOverThreeDays,
      ChartPeriod.MONTH,
      tokyo
    );

    expect(ticks.map(formatTick)).toEqual(['1/15', '1/16', '1/17']);
    expect(formatHeading(afternoon)).toBe('1/15 15:00');
  });

  it('heads a lone reading with the period format', () => {
    const { formatHeading } = getTimeAxisTicks(
      [tokyoMidnight],
      ChartPeriod.MONTH,
      tokyo
    );

    expect(formatHeading(tokyoMidnight)).toBe('1/15');
  });
});

describe('locale formatting', () => {
  const threeTokyoDays = hourlyTimestamps(tokyoMidnight, 72);

  it.each`
    locale     | period               | expected
    ${'ja-JP'} | ${ChartPeriod.DAY}   | ${'00:00'}
    ${'ja-JP'} | ${ChartPeriod.MONTH} | ${'1/15'}
    ${'ja-JP'} | ${ChartPeriod.YEAR}  | ${'2026/1'}
    ${'en-GB'} | ${ChartPeriod.DAY}   | ${'00:00'}
    ${'en-GB'} | ${ChartPeriod.MONTH} | ${'15/01'}
    ${'en-GB'} | ${ChartPeriod.YEAR}  | ${'01/2026'}
  `(
    'formats a $period tick as $expected in $locale',
    ({ locale, period, expected }) => {
      const result = formatTimestamp(tokyoMidnight, period, tokyo, locale);

      expect(result).toBe(expected);
    }
  );

  it.each`
    period               | expected
    ${ChartPeriod.DAY}   | ${'00:00'}
    ${ChartPeriod.MONTH} | ${'1/15'}
    ${ChartPeriod.YEAR}  | ${'2026/1'}
  `(
    'keeps the locale-neutral $period format when no locale is given',
    ({ period, expected }) => {
      const result = formatTimestamp(tokyoMidnight, period, tokyo);

      expect(result).toBe(expected);
    }
  );

  it('falls back to the locale-neutral format for an unusable locale', () => {
    const unusableLocale = 'not a locale';

    const result = formatTimestamp(
      tokyoMidnight,
      ChartPeriod.MONTH,
      tokyo,
      unusableLocale
    );

    expect(result).toBe('1/15');
  });

  it('labels the ticks of a chart in the given locale', () => {
    const { ticks, formatTick } = getTimeAxisTicks(
      threeTokyoDays,
      ChartPeriod.MONTH,
      tokyo,
      'en-GB'
    );

    expect(ticks.map(formatTick)).toEqual(['15/01', '16/01', '17/01']);
  });

  it.each`
    period
    ${ChartPeriod.DAY}
    ${ChartPeriod.WEEK}
    ${ChartPeriod.MONTH}
  `(
    'carries the date into a $period heading in the given locale',
    ({ period }) => {
      const { formatHeading } = getTimeAxisTicks(
        threeTokyoDays,
        period,
        tokyo,
        'en-GB'
      );

      const heading = formatHeading(tokyoMidnight);
      expect(heading).toContain('15/01');
      expect(heading).toContain('00:00');
    }
  );

  it('leaves a daily chart heading on the locale day format', () => {
    const { formatHeading } = getTimeAxisTicks(
      dailyTimestamps(tokyoMidnight, 3),
      ChartPeriod.MONTH,
      tokyo,
      'en-GB'
    );

    expect(formatHeading(tokyoMidnight)).toBe('15/01');
  });
});
