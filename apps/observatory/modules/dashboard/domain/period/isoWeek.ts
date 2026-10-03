import {
  addDays,
  differenceInDays,
  parseCalendarDate,
  toEpochMilliseconds,
} from './calendarDate';

const WEEK_PATTERN = /^(\d{4})-W(\d{2})$/;
const DAYS_PER_WEEK = 7;

function mondayOf(date: string) {
  const weekday =
    ((new Date(toEpochMilliseconds(date)).getUTCDay() + 6) % 7) + 1;
  return addDays(date, 1 - weekday);
}

export function weekBounds(date: string): {
  firstDate: string;
  lastDate: string;
} {
  const firstDate = mondayOf(date);
  return { firstDate, lastDate: addDays(firstDate, DAYS_PER_WEEK - 1) };
}

export function formatWeek(firstDate: string): string {
  const thursday = addDays(mondayOf(firstDate), 3);
  const year = thursday.slice(0, 4);
  const week =
    Math.floor(differenceInDays(`${year}-01-01`, thursday) / DAYS_PER_WEEK) + 1;
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function weekAnchorDate(text: string): string | null {
  const match = WEEK_PATTERN.exec(text);
  if (match === null) {
    return null;
  }
  const week = Number(match[2]);
  if (week < 1 || week > 53) {
    return null;
  }
  const januaryFourth = parseCalendarDate(`${match[1]}-01-04`);
  if (januaryFourth === null) {
    return null;
  }
  const firstDate = addDays(
    mondayOf(januaryFourth),
    (week - 1) * DAYS_PER_WEEK
  );
  return formatWeek(firstDate) === text ? firstDate : null;
}

export function shiftWeekFirstDate(firstDate: string, offset: number): string {
  return addDays(firstDate, offset * DAYS_PER_WEEK);
}

export function countWeeks(firstDate: string, lastDate: string): number {
  return (
    differenceInDays(mondayOf(firstDate), mondayOf(lastDate)) / DAYS_PER_WEEK +
    1
  );
}
