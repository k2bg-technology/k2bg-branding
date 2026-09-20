/** 0 is Sunday through 6 is Saturday, matching `Date#getUTCDay`. */
export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface CalendarMonthLabel {
  /** Index of the week column the label sits above. */
  columnIndex: number;
  text: string;
}

export interface CalendarMonthLabelOptions {
  /** Every day of the grid in column-major order, as `YYYY-MM-DD`. */
  dates: string[];
  /** Width of one week column in px, gap included, used to skip colliding labels. */
  columnWidth: number;
  /** BCP 47 tag; without it the label stays the locale-neutral numeric month. */
  locale?: string;
}

const daysPerWeek = 7;
const mondayStart: WeekStartDay = 1;
const utcTimeZone = 'UTC';
/** 1970-01-04 was a Sunday, so that day of January plus a weekday number names the weekday. */
const knownSundayDayOfMonth = 4;
const weekStartDays: readonly WeekStartDay[] = [0, 1, 2, 3, 4, 5, 6];

/** Caption glyphs run about half the font size wide, and CJK ones the full size. */
const narrowGlyphWidth = 7;
const wideGlyphWidth = 12;
const firstWideCodePoint = 0x2e80;

interface WeekInfo {
  firstDay: number;
}

/** Week information is a method in newer engines and a property in older ones, and neither is typed. */
interface LocaleWithWeekInfo extends Intl.Locale {
  getWeekInfo?: () => WeekInfo;
  weekInfo?: WeekInfo;
}

function localeWeekStart(locale: string): WeekStartDay | undefined {
  const source: LocaleWithWeekInfo = new Intl.Locale(locale);
  const firstDay = (source.getWeekInfo?.() ?? source.weekInfo)?.firstDay;
  if (firstDay === undefined) {
    return undefined;
  }
  // Locale week information counts Monday as 1 through Sunday as 7.
  return weekStartDays[firstDay % daysPerWeek];
}

export function resolveWeekStart(options: {
  locale?: string;
  weekStartsOn?: WeekStartDay;
}): WeekStartDay {
  const { locale, weekStartsOn } = options;
  if (weekStartsOn !== undefined) {
    return weekStartsOn;
  }
  return (
    (locale === undefined ? undefined : localeWeekStart(locale)) ?? mondayStart
  );
}

/** Seven weekday names in display order, starting at `weekStart`. */
export function localeWeekdayNames(
  locale: string,
  weekStart: WeekStartDay
): string[] {
  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    timeZone: utcTimeZone,
  });
  return Array.from({ length: daysPerWeek }, (_, index) =>
    formatter.format(
      new Date(
        Date.UTC(
          1970,
          0,
          knownSundayDayOfMonth + ((weekStart + index) % daysPerWeek)
        )
      )
    )
  );
}

/** Row of a day inside a week that starts on `weekStart`. */
export function weekdayOffset(
  timestamp: number,
  weekStart: WeekStartDay
): number {
  return (
    (new Date(timestamp).getUTCDay() - weekStart + daysPerWeek) % daysPerWeek
  );
}

function glyphWidth(character: string): number {
  return (character.codePointAt(0) ?? 0) >= firstWideCodePoint
    ? wideGlyphWidth
    : narrowGlyphWidth;
}

/** Week columns a label needs before the next one may start. */
function textColumns(text: string, columnWidth: number): number {
  const width = Array.from(text).reduce(
    (total, character) => total + glyphWidth(character),
    0
  );
  return Math.max(1, Math.ceil(width / columnWidth));
}

/**
 * One label per month, above the week column holding that month's first day.
 * Labels that would run into the next one are dropped rather than overlapped.
 */
export function calendarMonthLabels({
  dates,
  columnWidth,
  locale,
}: CalendarMonthLabelOptions): CalendarMonthLabel[] {
  const monthFormatter =
    locale === undefined
      ? undefined
      : new Intl.DateTimeFormat(locale, {
          month: 'short',
          timeZone: utcTimeZone,
        });

  const monthStarts = dates.flatMap((date, index) =>
    date.endsWith('-01')
      ? [{ columnIndex: Math.floor(index / daysPerWeek), date }]
      : []
  );

  const candidates = monthStarts.map(({ columnIndex, date }, index) => {
    const [year, month] = date.split('-').map(Number);
    if (monthFormatter !== undefined) {
      return {
        columnIndex,
        text: monthFormatter.format(new Date(Date.UTC(year, month - 1, 1))),
      };
    }
    const previousYear =
      index === 0 ? year : Number(monthStarts[index - 1].date.slice(0, 4));
    return {
      columnIndex,
      text: year === previousYear ? String(month) : `${year}/${month}`,
    };
  });

  return candidates.reduce<CalendarMonthLabel[]>((kept, label) => {
    const previous = kept[kept.length - 1];
    const collides =
      previous !== undefined &&
      label.columnIndex - previous.columnIndex <
        textColumns(previous.text, columnWidth);
    return collides ? kept : kept.concat(label);
  }, []);
}
