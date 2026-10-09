import { DomainError } from '../errors';
import { formatCalendarDate, toEpochMilliseconds } from './calendarDate';
import { Period } from './period';
import {
  formatBucketKey,
  type SectionBucket,
  SectionGrain,
} from './sectionGrain';

export interface AvailabilityInput {
  grain: SectionGrain;
  since: string;
  minimumBuckets: number;
  lastDate: string;
}

export type Availability =
  | { status: 'available' }
  | { status: 'accumulating'; availableFrom: SectionBucket };

export function resolveAvailability({
  grain,
  since,
  minimumBuckets,
  lastDate,
}: AvailabilityInput): Availability {
  const availableFrom = (() => {
    if (grain === SectionGrain.HOUR) {
      const target = new Date(
        toEpochMilliseconds(since) + minimumBuckets * 3_600_000
      );
      return { date: formatCalendarDate(target), hour: target.getUTCHours() };
    }
    const shifted = Period.containing(grain, since)?.shift(minimumBuckets);
    if (shifted === undefined) {
      throw new DomainError('Invalid availability date');
    }
    return { date: shifted.firstDate, hour: 0 };
  })();
  const last = (() => {
    if (grain === SectionGrain.HOUR) {
      return { date: lastDate, hour: 23 };
    }
    const period = Period.containing(grain, lastDate);
    if (period === null) {
      throw new DomainError('Invalid availability date');
    }
    return { date: period.firstDate, hour: 0 };
  })();
  return formatBucketKey(grain, last) < formatBucketKey(grain, availableFrom)
    ? { status: 'accumulating', availableFrom: { grain, start: availableFrom } }
    : { status: 'available' };
}
