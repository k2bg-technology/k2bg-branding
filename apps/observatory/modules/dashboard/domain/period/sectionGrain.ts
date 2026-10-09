import { parseCalendarDate } from './calendarDate';
import { Period, PeriodGrain } from './period';

export const SectionGrain = { ...PeriodGrain, HOUR: 'hour' } as const;
export type SectionGrain = (typeof SectionGrain)[keyof typeof SectionGrain];

export interface BucketStart {
  date: string;
  hour: number;
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
