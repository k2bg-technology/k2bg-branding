import { type DateBounds, Period, type PeriodGrain } from './period';

interface Input {
  defaultPeriod: 'latest-with-data' | 'last-complete';
  grain: PeriodGrain;
  timeZone: string;
  bounds: DateBounds;
  now: number;
}

export function resolveDefaultPeriod({
  defaultPeriod,
  grain,
  timeZone,
  bounds,
  now,
}: Input): Period {
  const first = Period.containing(grain, bounds.firstDate);
  const last = Period.containing(grain, bounds.lastDate);
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
    day: '2-digit',
  }).formatToParts(new Date(now));
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  const current = Period.containing(grain, `${year}-${month}-${day}`);
  if (current === null) {
    throw new Error('Invalid current dashboard date');
  }
  const complete = current.shift(-1);
  if (complete.firstDate < first.firstDate) {
    return first;
  }
  if (complete.firstDate > last.firstDate) {
    return last;
  }
  return complete;
}
