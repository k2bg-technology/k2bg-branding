const MONTH_PATTERN = /^(\d{4})-(\d{2})$/;
const CALENDAR_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function formatCalendarDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export class Period {
  private constructor(
    public readonly year: number,
    public readonly month: number
  ) {}

  static parse(value: string): Period | null {
    const match = MONTH_PATTERN.exec(value);
    if (match === null) {
      return null;
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    return month >= 1 && month <= 12 ? new Period(year, month) : null;
  }

  static fromCalendarDate(value: string): Period | null {
    const match = CALENDAR_DATE_PATTERN.exec(value);
    if (match === null) {
      return null;
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    return formatCalendarDate(date) === value ? new Period(year, month) : null;
  }

  get firstDate(): string {
    return formatCalendarDate(new Date(Date.UTC(this.year, this.month - 1, 1)));
  }

  get lastDate(): string {
    return formatCalendarDate(new Date(Date.UTC(this.year, this.month, 0)));
  }

  shift(months: number): Period {
    const shifted = new Date(Date.UTC(this.year, this.month - 1 + months, 1));
    return new Period(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1);
  }

  toString(): string {
    return `${String(this.year).padStart(4, '0')}-${String(this.month).padStart(2, '0')}`;
  }
}

export interface DateBounds {
  firstDate: string;
  lastDate: string;
}
