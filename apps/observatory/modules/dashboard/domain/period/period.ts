import {
  addDays,
  differenceInDays,
  formatCalendarDate,
  parseCalendarDate,
  toEpochMilliseconds,
} from './calendarDate';
import {
  countWeeks,
  formatWeek,
  shiftWeekFirstDate,
  weekAnchorDate,
  weekBounds,
} from './isoWeek';

export const PeriodGrain = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
} as const;
export type PeriodGrain = (typeof PeriodGrain)[keyof typeof PeriodGrain];

export interface DateBounds {
  firstDate: string;
  lastDate: string;
}

interface GrainBehavior {
  parse(text: string): string | null;
  bounds(date: string): DateBounds;
  shiftFirstDate(firstDate: string, offset: number): string;
  count(firstDate: string, lastDate: string): number;
  toString(firstDate: string): string;
  labelOptions: Intl.DateTimeFormatOptions;
  rangeOptions: Intl.DateTimeFormatOptions;
}

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const grainBehaviors: Record<PeriodGrain, GrainBehavior> = {
  [PeriodGrain.MONTH]: {
    parse: (text) => (MONTH_PATTERN.test(text) ? `${text}-01` : null),
    bounds: (date) => {
      const firstDate = `${date.slice(0, 7)}-01`;
      const [year, month] = firstDate.split('-').map(Number);
      return {
        firstDate,
        lastDate: formatCalendarDate(new Date(Date.UTC(year, month, 0))),
      };
    },
    shiftFirstDate: (firstDate, offset) => {
      const [year, month] = firstDate.split('-').map(Number);
      return formatCalendarDate(
        new Date(Date.UTC(year, month - 1 + offset, 1))
      );
    },
    count: (firstDate, lastDate) => {
      const firstYear = Number(firstDate.slice(0, 4));
      const lastYear = Number(lastDate.slice(0, 4));
      const firstMonth = Number(firstDate.slice(5, 7));
      const lastMonth = Number(lastDate.slice(5, 7));
      return (lastYear - firstYear) * 12 + lastMonth - firstMonth + 1;
    },
    toString: (firstDate) => firstDate.slice(0, 7),
    labelOptions: { year: 'numeric', month: 'long' },
    rangeOptions: { year: 'numeric', month: 'short' },
  },
  [PeriodGrain.WEEK]: {
    parse: weekAnchorDate,
    bounds: weekBounds,
    shiftFirstDate: shiftWeekFirstDate,
    count: countWeeks,
    toString: formatWeek,
    labelOptions: { year: 'numeric', month: 'short', day: 'numeric' },
    rangeOptions: { year: 'numeric', month: 'short', day: 'numeric' },
  },
  [PeriodGrain.DAY]: {
    parse: parseCalendarDate,
    bounds: (date) => ({ firstDate: date, lastDate: date }),
    shiftFirstDate: addDays,
    count: (firstDate, lastDate) => differenceInDays(firstDate, lastDate) + 1,
    toString: (firstDate) => firstDate,
    labelOptions: { year: 'numeric', month: 'long', day: 'numeric' },
    rangeOptions: { year: 'numeric', month: 'short', day: 'numeric' },
  },
};

export class Period {
  private constructor(
    readonly grain: PeriodGrain,
    readonly firstDate: string,
    readonly lastDate: string
  ) {}

  static parse(grain: PeriodGrain, text: string): Period | null {
    const anchor = grainBehaviors[grain].parse(text);
    return anchor === null ? null : Period.containing(grain, anchor);
  }

  static containing(grain: PeriodGrain, calendarDate: string): Period | null {
    const date = parseCalendarDate(calendarDate);
    if (date === null) {
      return null;
    }
    const { firstDate, lastDate } = grainBehaviors[grain].bounds(date);
    return new Period(grain, firstDate, lastDate);
  }

  shift(offset: number): Period {
    const firstDate = grainBehaviors[this.grain].shiftFirstDate(
      this.firstDate,
      offset
    );
    const shifted = Period.containing(this.grain, firstDate);
    if (shifted === null) {
      throw new Error('Invalid shifted period');
    }
    return shifted;
  }

  distanceTo(other: Period): number {
    if (this.grain !== other.grain) {
      throw new Error('Cannot compare periods of different grains');
    }
    const first = this.firstDate <= other.firstDate ? this : other;
    const last = this.firstDate <= other.firstDate ? other : this;
    const distance =
      grainBehaviors[this.grain].count(first.firstDate, last.firstDate) - 1;
    return this === first ? distance : -distance;
  }

  toString(): string {
    return grainBehaviors[this.grain].toString(this.firstDate);
  }

  label(locale: string): string {
    const formatter = new Intl.DateTimeFormat(locale, {
      timeZone: 'UTC',
      ...grainBehaviors[this.grain].labelOptions,
    });
    return formatter.formatRange(
      toEpochMilliseconds(this.firstDate),
      toEpochMilliseconds(this.lastDate)
    );
  }
}

export function formatPeriodRange(
  first: Period,
  last: Period,
  locale: string
): string {
  if (first.grain !== last.grain) {
    throw new Error('Cannot format periods of different grains');
  }
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    ...grainBehaviors[first.grain].rangeOptions,
  });
  return formatter.formatRange(
    toEpochMilliseconds(first.firstDate),
    toEpochMilliseconds(last.lastDate)
  );
}
