import { parseCalendarDate, toEpochMilliseconds } from './calendarDate';

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string) {
  const existing = formatters.get(timeZone);
  if (existing !== undefined) {
    return existing;
  }
  const formatter = new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
  formatters.set(timeZone, formatter);
  return formatter;
}

function wallEpoch(formatter: Intl.DateTimeFormat, instant: number) {
  const parts = Object.fromEntries(
    formatter
      .formatToParts(instant)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)])
  );
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
}

export function toInstant(
  date: string,
  hour: number,
  timeZone: string
): number | null {
  if (
    parseCalendarDate(date) === null ||
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23
  ) {
    return null;
  }
  const nominalEpoch = toEpochMilliseconds(date) + hour * 3_600_000;
  const formatter = formatterFor(timeZone);
  const offsets = new Set(
    Array.from(
      { length: 73 },
      (_, index) => nominalEpoch + (index - 36) * 3_600_000
    ).map((probe) => wallEpoch(formatter, probe) - probe)
  );
  return (
    Array.from(offsets)
      .map((offset) => nominalEpoch - offset)
      .filter((candidate) => wallEpoch(formatter, candidate) === nominalEpoch)
      .sort((first, second) => first - second)[0] ?? null
  );
}
