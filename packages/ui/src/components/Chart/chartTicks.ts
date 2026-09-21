import { ChartPeriod } from './types';

const tickTargetCount: Record<ChartPeriod, number> = {
  day: 6,
  week: 7,
  month: 6,
  quarter: 4,
  year: 6,
};

const defaultTimeZone = 'UTC';

/** How much of the wall clock a label carries. */
type TimeGranularity = 'time' | 'day' | 'month' | 'dayTime';

const granularityByPeriod: Record<ChartPeriod, TimeGranularity> = {
  day: 'time',
  week: 'day',
  month: 'day',
  quarter: 'day',
  year: 'month',
};

const localeFormatOptions: Record<TimeGranularity, Intl.DateTimeFormatOptions> =
  {
    time: { hour: '2-digit', minute: '2-digit' },
    day: { month: 'numeric', day: 'numeric' },
    month: { year: 'numeric', month: 'numeric' },
    dayTime: {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  };

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

function formatWallClock(
  timestamp: number,
  granularity: TimeGranularity,
  timeZone: string
): string {
  const { year, month, day, hour, minute } = wallClock(timestamp, timeZone);
  const time = `${padTwoDigits(hour)}:${padTwoDigits(minute)}`;
  switch (granularity) {
    case 'time':
      return time;
    case 'day':
      return `${month}/${day}`;
    case 'month':
      return `${year}/${month}`;
    case 'dayTime':
      return `${month}/${day} ${time}`;
  }
}

// A locale formatter is cached like the wall-clock one; `null` records a locale
// the runtime rejected, so a broken locale never crashes a chart.
const localeFormatterCache = new Map<string, Intl.DateTimeFormat | null>();

function createLocaleFormatter(
  locale: string,
  granularity: TimeGranularity,
  timeZone: string
): Intl.DateTimeFormat | null {
  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone,
      ...localeFormatOptions[granularity],
    });
  } catch {
    return null;
  }
}

function localeFormatter(
  locale: string,
  granularity: TimeGranularity,
  timeZone: string
): Intl.DateTimeFormat | null {
  const cacheKey = `${locale}|${granularity}|${timeZone}`;
  const cached = localeFormatterCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  const formatter = createLocaleFormatter(locale, granularity, timeZone);
  localeFormatterCache.set(cacheKey, formatter);
  return formatter;
}

function formatAtGranularity(
  timestamp: number,
  granularity: TimeGranularity,
  timeZone: string,
  locale?: string
): string {
  if (locale !== undefined) {
    const formatter = localeFormatter(locale, granularity, timeZone);
    if (formatter !== null) {
      return formatter.format(new Date(timestamp));
    }
  }
  return formatWallClock(timestamp, granularity, timeZone);
}

/** Locale-neutral numeric formats, read in `timeZone` for determinism;
 *  `locale` switches to that locale's own format at the same granularity. */
export function formatTimestamp(
  timestamp: number,
  period: ChartPeriod,
  timeZone: string = defaultTimeZone,
  locale?: string
): string {
  return formatAtGranularity(
    timestamp,
    granularityByPeriod[period],
    timeZone,
    locale
  );
}

function dateKey(clock: WallClock): string {
  return `${clock.year}-${clock.month}-${clock.day}`;
}

/** Bucketing on the wall clock lands each tick on the local date boundary. */
function bucketKey(
  timestamp: number,
  period: ChartPeriod,
  timeZone: string
): string {
  const clock = wallClock(timestamp, timeZone);
  return period === ChartPeriod.DAY
    ? `${dateKey(clock)}-${clock.hour}`
    : dateKey(clock);
}

/**
 * Ticks answer where a point sits on the axis and may stay coarse, but a
 * heading has to identify the one reading under the pointer, so it follows how
 * often the data was sampled instead of the period. Readings that share a date
 * are told apart by their time, dated once they spread over several days.
 */
function headingGranularity(
  period: ChartPeriod,
  dateCount: number,
  pointCount: number
): TimeGranularity {
  const isSubDaily = dateCount < pointCount;
  if (!isSubDaily) {
    return granularityByPeriod[period];
  }
  return dateCount > 1 ? 'dayTime' : 'time';
}

export function getTimeAxisTicks(
  timestamps: number[],
  period: ChartPeriod,
  timeZone: string = defaultTimeZone,
  locale?: string
): {
  ticks: number[];
  formatTick: (timestamp: number) => string;
  formatHeading: (timestamp: number) => string;
} {
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

  const tickGranularity = granularityByPeriod[period];
  const dateCount = new Set(
    sorted.map((timestamp) => dateKey(wallClock(timestamp, timeZone)))
  ).size;
  const tooltipGranularity = headingGranularity(
    period,
    dateCount,
    sorted.length
  );

  return {
    ticks,
    formatTick: (timestamp) =>
      formatAtGranularity(timestamp, tickGranularity, timeZone, locale),
    formatHeading: (timestamp) =>
      formatAtGranularity(timestamp, tooltipGranularity, timeZone, locale),
  };
}

export function defaultValueFormatter(value: number): string {
  return String(value);
}
