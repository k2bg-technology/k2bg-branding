import { type DateBounds, Period } from './period';

interface Input {
  defaultPeriod: 'latest-with-data' | 'last-complete';
  timeZone: string;
  bounds: DateBounds;
  now: number;
}

export function resolveDefaultPeriod({
  defaultPeriod,
  timeZone,
  bounds,
  now,
}: Input): Period {
  const first = Period.fromCalendarDate(bounds.firstDate);
  const last = Period.fromCalendarDate(bounds.lastDate);
  if (first === null || last === null) {
    throw new Error('Invalid dashboard period bounds');
  }
  if (defaultPeriod === 'latest-with-data') {
    return last;
  }
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date(now));
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const current = Period.parse(`${year}-${month}`);
  if (current === null) {
    throw new Error('Invalid current dashboard month');
  }
  const complete = current.shift(-1);
  if (complete.toString() < first.toString()) {
    return first;
  }
  if (complete.toString() > last.toString()) {
    return last;
  }
  return complete;
}
