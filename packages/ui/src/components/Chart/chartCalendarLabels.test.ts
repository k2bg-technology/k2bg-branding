import { describe, expect, it } from 'vitest';

import {
  calendarMonthLabels,
  localeWeekdayNames,
  resolveWeekStart,
  type WeekStartDay,
  weekdayOffset,
} from './chartCalendarLabels';

const dayMs = 86_400_000;
const daysPerWeek = 7;
const sunday: WeekStartDay = 0;
const monday: WeekStartDay = 1;
const wednesday: WeekStartDay = 3;

/** A 12px cell plus the 2px gap between cells. */
const defaultColumnWidth = 14;
/** A 4px cell plus the gap, narrow enough for labels to run into each other. */
const narrowColumnWidth = 6;
/** Narrower still, so a two-glyph CJK month name spans five columns. */
const wideGlyphColumnWidth = 4;

/** Locale week information counts Monday as 1 through Sunday as 7. */
const sundayFirstDay = 7;

/** An engine that exposes week information as a property, not as a method. */
class LocaleWithWeekInfoProperty {
  readonly weekInfo = { firstDay: sundayFirstDay };
}

/** An engine that exposes no week information at all. */
class LocaleWithoutWeekInfo {
  readonly baseName = 'en-US';
}

/** Reads a value with `Intl.Locale` swapped for another engine's. */
function withLocaleEngine<T>(
  engine: new (tag: string) => object,
  read: () => T
): T {
  const original = Intl.Locale;
  Object.defineProperty(Intl, 'Locale', { value: engine, configurable: true });
  try {
    return read();
  } finally {
    Object.defineProperty(Intl, 'Locale', {
      value: original,
      configurable: true,
    });
  }
}

/** Whole weeks of consecutive days, in the column-major order the grid uses. */
function gridDates(start: string, weeks: number): string[] {
  const [year, month, day] = start.split('-').map(Number);
  const startTime = Date.UTC(year, month - 1, day);
  return Array.from({ length: weeks * daysPerWeek }, (_, index) =>
    new Date(startTime + index * dayMs).toISOString().slice(0, 10)
  );
}

/** 2025-11-24 is a Monday, and twelve weeks from it cross into 2026. */
const acrossYearEnd = gridDates('2025-11-24', 12);

describe('resolveWeekStart', () => {
  it('starts the week on Monday without a locale or an override', () => {
    const result = resolveWeekStart({});

    expect(result).toBe(monday);
  });

  it('takes the first day of the week from the locale', () => {
    const result = resolveWeekStart({ locale: 'en-US' });

    expect(result).toBe(sunday);
  });

  it('lets the given week start win over the locale', () => {
    const result = resolveWeekStart({ locale: 'en-US', weekStartsOn: monday });

    expect(result).toBe(monday);
  });

  it('reads the first day of the week from a weekInfo property', () => {
    // A locale this runtime starts on Monday, so only the property can answer.
    const result = withLocaleEngine(LocaleWithWeekInfoProperty, () =>
      resolveWeekStart({ locale: 'de-DE' })
    );

    expect(result).toBe(sunday);
  });

  it('starts the week on Monday when the engine knows no week information', () => {
    const result = withLocaleEngine(LocaleWithoutWeekInfo, () =>
      resolveWeekStart({ locale: 'en-US' })
    );

    expect(result).toBe(monday);
  });
});

describe('localeWeekdayNames', () => {
  it.each`
    locale     | weekStart | expected
    ${'en-US'} | ${monday} | ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
    ${'en-US'} | ${sunday} | ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
    ${'ja-JP'} | ${sunday} | ${['日', '月', '火', '水', '木', '金', '土']}
  `(
    'names $locale weekdays in display order from day $weekStart',
    ({ locale, weekStart, expected }) => {
      const result = localeWeekdayNames(locale, weekStart);

      expect(result).toEqual(expected);
    }
  );
});

describe('weekdayOffset', () => {
  /** 2026-02-25 is a Wednesday. */
  const wednesdayTime = Date.UTC(2026, 1, 25);

  it.each`
    weekStart    | expected
    ${monday}    | ${2}
    ${sunday}    | ${3}
    ${wednesday} | ${0}
  `(
    'puts Wednesday on row $expected in a week starting on day $weekStart',
    ({ weekStart, expected }) => {
      const result = weekdayOffset(wednesdayTime, weekStart);

      expect(result).toBe(expected);
    }
  );
});

describe('calendarMonthLabels', () => {
  it.each`
    range                           | dates                         | expected
    ${'a range starting mid-month'} | ${gridDates('2026-02-23', 3)} | ${[{ columnIndex: 0, text: '3' }]}
    ${'a range crossing a year'}    | ${acrossYearEnd}              | ${[{ columnIndex: 1, text: '12' }, { columnIndex: 5, text: '2026/1' }, { columnIndex: 9, text: '2' }]}
  `('labels the month columns of $range', ({ dates, expected }) => {
    const result = calendarMonthLabels({
      dates,
      columnWidth: defaultColumnWidth,
    });

    expect(result).toEqual(expected);
  });

  it('skips a label that the previous one would run into', () => {
    const result = calendarMonthLabels({
      dates: acrossYearEnd,
      columnWidth: narrowColumnWidth,
    });

    expect(result).toEqual([
      { columnIndex: 1, text: '12' },
      { columnIndex: 5, text: '2026/1' },
    ]);
  });

  it('skips a label a wide-glyph month name would run into', () => {
    // 2025-12-29 is a Monday, and `1月` spans five columns at this width while
    // February starts only four columns along.
    const result = calendarMonthLabels({
      dates: gridDates('2025-12-29', 10),
      columnWidth: wideGlyphColumnWidth,
      locale: 'ja-JP',
    });

    expect(result).toEqual([
      { columnIndex: 0, text: '1月' },
      { columnIndex: 8, text: '3月' },
    ]);
  });

  it('names the months in the given locale', () => {
    const result = calendarMonthLabels({
      dates: gridDates('2026-08-31', 6),
      columnWidth: defaultColumnWidth,
      locale: 'en-US',
    });

    expect(result).toEqual([
      { columnIndex: 0, text: 'Sep' },
      { columnIndex: 4, text: 'Oct' },
    ]);
  });

  it('returns no labels when no month starts inside the range', () => {
    const result = calendarMonthLabels({
      dates: gridDates('2026-02-02', 2),
      columnWidth: defaultColumnWidth,
    });

    expect(result).toEqual([]);
  });
});
