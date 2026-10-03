import { DomainError } from '../errors';
import { formatCalendarDate, toEpochMilliseconds } from './calendarDate';
import { type DateBounds, Period, type PeriodGrain } from './period';
import {
  type BucketStart,
  formatBucketKey,
  parseBucketKey,
  type SectionGrain,
} from './sectionGrain';

interface SectionRangeInput {
  grain?: SectionGrain;
  window?: number;
}

interface RetainedRange {
  truncated: boolean;
  firstBucket?: string;
}

interface DisplayRange {
  first: BucketStart;
  last: BucketStart;
}

export type SectionRange = {
  dateRange: DateBounds;
  display: DisplayRange;
} & (
  | { grain: PeriodGrain; firstHour?: never }
  | { grain: 'hour'; firstHour: number }
);

export function resolveSectionRange(
  section: SectionRangeInput,
  selectedPeriod: Period,
  retained?: RetainedRange
): SectionRange {
  const grain = section.grain ?? selectedPeriod.grain;
  if (grain === 'hour') {
    const last = { date: selectedPeriod.lastDate, hour: 23 };
    const nominalLast = toEpochMilliseconds(last.date) + last.hour * 3_600_000;
    const nominalFirst = new Date(
      nominalLast - ((section.window ?? 24) - 1) * 3_600_000
    );
    const first = {
      date: formatCalendarDate(nominalFirst),
      hour: nominalFirst.getUTCHours(),
    };
    const displayFirst = retained?.truncated
      ? parseBucketKey(grain, retained.firstBucket ?? '')
      : first;
    if (
      displayFirst === null ||
      formatBucketKey(grain, displayFirst) < formatBucketKey(grain, first) ||
      formatBucketKey(grain, displayFirst) > formatBucketKey(grain, last)
    ) {
      throw new DomainError('Retained bucket is outside the requested range');
    }
    return {
      grain,
      firstHour: first.hour,
      dateRange: { firstDate: first.date, lastDate: last.date },
      display: { first: displayFirst, last },
    };
  }

  const lastPeriod = Period.containing(grain, selectedPeriod.lastDate);
  const firstPeriod =
    section.window === undefined
      ? Period.containing(grain, selectedPeriod.firstDate)
      : lastPeriod?.shift(-(section.window - 1));
  if (firstPeriod == null || lastPeriod === null) {
    throw new DomainError('Invalid section range');
  }
  const first = { date: firstPeriod.firstDate, hour: 0 };
  const last = { date: lastPeriod.firstDate, hour: 0 };
  const displayFirst = retained?.truncated
    ? parseBucketKey(grain, retained.firstBucket ?? '')
    : first;
  if (
    displayFirst === null ||
    formatBucketKey(grain, displayFirst) < formatBucketKey(grain, first) ||
    formatBucketKey(grain, displayFirst) > formatBucketKey(grain, last)
  ) {
    throw new DomainError('Retained bucket is outside the requested range');
  }
  return {
    grain,
    dateRange: {
      firstDate: firstPeriod.firstDate,
      lastDate: lastPeriod.lastDate,
    },
    display: { first: displayFirst, last },
  };
}
