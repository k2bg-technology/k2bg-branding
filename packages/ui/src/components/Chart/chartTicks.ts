import { ChartPeriod } from './types';

const tickTargetCount: Record<ChartPeriod, number> = {
  day: 6,
  week: 7,
  month: 6,
  quarter: 4,
  year: 6,
};

const defaultTimeZone = 'UTC';

interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

// Formatters are expensive to construct and every tick of a chart shares one.
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function wallClockFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = formatterCache.get(timeZone);
  if (cached !== undefined) {
    return cached;
  }
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    // `hour12: false` renders midnight as '24' in some ICU versions.
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  formatterCache.set(timeZone, formatter);
  return formatter;
}

/** `formatToParts` keeps offset math out and stays DST-safe. */
function wallClock(timestamp: number, timeZone: string): WallClock {
  const parts = wallClockFormatter(timeZone).formatToParts(new Date(timestamp));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((candidate) => candidate.type === type)?.value);
  return {
    year: part('year'),
    month: part('month'),
    day: part('day'),
    hour: part('hour'),
    minute: part('minute'),
  };
}

function padTwoDigits(value: number): string {
  return String(value).padStart(2, '0');
}

/** Locale-neutral numeric formats, read in `timeZone` for determinism. */
export function formatTimestamp(
  timestamp: number,
  period: ChartPeriod,
  timeZone: string = defaultTimeZone
): string {
  const { year, month, day, hour, minute } = wallClock(timestamp, timeZone);
  switch (period) {
    case ChartPeriod.DAY:
      return `${padTwoDigits(hour)}:${padTwoDigits(minute)}`;
    case ChartPeriod.WEEK:
    case ChartPeriod.MONTH:
    case ChartPeriod.QUARTER:
      return `${month}/${day}`;
    case ChartPeriod.YEAR:
      return `${year}/${month}`;
  }
}

/** Bucketing on the wall clock lands each tick on the local date boundary. */
function bucketKey(
  timestamp: number,
  period: ChartPeriod,
  timeZone: string
): string {
  const { year, month, day, hour } = wallClock(timestamp, timeZone);
  const date = `${year}-${month}-${day}`;
  return period === ChartPeriod.DAY ? `${date}-${hour}` : date;
}

export function getTimeAxisTicks(
  timestamps: number[],
  period: ChartPeriod,
  timeZone: string = defaultTimeZone
): { ticks: number[]; formatTick: (timestamp: number) => string } {
  const sorted = Array.from(new Set(timestamps)).sort(
    (first, second) => first - second
  );
  const seenBuckets = new Set<string>();
  const anchors = sorted.filter((timestamp) => {
    const key = bucketKey(timestamp, period, timeZone);
    if (seenBuckets.has(key)) {
      return false;
    }
    seenBuckets.add(key);
    return true;
  });
  const step = Math.max(1, Math.ceil(anchors.length / tickTargetCount[period]));
  const ticks = anchors.filter((_, index) => index % step === 0);

  return {
    ticks,
    formatTick: (timestamp) => formatTimestamp(timestamp, period, timeZone),
  };
}

export function defaultValueFormatter(value: number): string {
  return String(value);
}
