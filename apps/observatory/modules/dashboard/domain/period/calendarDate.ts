const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MILLISECONDS_PER_DAY = 86_400_000;

export function formatCalendarDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function toEpochMilliseconds(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

export function parseCalendarDate(text: string): string | null {
  if (!CALENDAR_DATE_PATTERN.test(text)) {
    return null;
  }
  return formatCalendarDate(new Date(toEpochMilliseconds(text))) === text
    ? text
    : null;
}

export function addDays(date: string, count: number): string {
  return formatCalendarDate(
    new Date(toEpochMilliseconds(date) + count * MILLISECONDS_PER_DAY)
  );
}

export function differenceInDays(first: string, last: string): number {
  return (
    (toEpochMilliseconds(last) - toEpochMilliseconds(first)) /
    MILLISECONDS_PER_DAY
  );
}
