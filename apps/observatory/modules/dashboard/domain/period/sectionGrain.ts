import { parseCalendarDate, toEpochMilliseconds } from './calendarDate';
import { Period, PeriodGrain } from './period';

export const SectionGrain = { ...PeriodGrain, HOUR: 'hour' } as const;
export type SectionGrain = (typeof SectionGrain)[keyof typeof SectionGrain];

export interface BucketStart {
  date: string;
  hour: number;
}

export interface SectionBucket {
  grain: SectionGrain;
  start: BucketStart;
}

export function formatBucketLabel(
  bucket: SectionBucket,
  locale: string
): string {
  if (bucket.grain === SectionGrain.HOUR) {
    return new Intl.DateTimeFormat(locale, {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(
      toEpochMilliseconds(bucket.start.date) + bucket.start.hour * 3_600_000
    );
  }
  const period = Period.containing(bucket.grain, bucket.start.date);
  if (period === null) {
    throw new Error('Invalid bucket date');
  }
  return period.label(locale);
}

export function parseBucketKey(
  grain: SectionGrain,
  key: string
): BucketStart | null {
  if (grain !== SectionGrain.HOUR) {
    const period = Period.parse(grain, key);
    return period === null ? null : { date: period.firstDate, hour: 0 };
  }
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2})$/.exec(key);
  if (match === null || parseCalendarDate(match[1]) === null) {
    return null;
  }
  const hour = Number(match[2]);
  return hour <= 23 ? { date: match[1], hour } : null;
}

export function formatBucketKey(
  grain: SectionGrain,
  start: BucketStart
): string {
  if (grain === SectionGrain.HOUR) {
    return `${start.date}T${String(start.hour).padStart(2, '0')}`;
  }
  const period = Period.containing(grain, start.date);
  if (period === null) {
    throw new Error('Invalid bucket date');
  }
  return period.toString();
}
