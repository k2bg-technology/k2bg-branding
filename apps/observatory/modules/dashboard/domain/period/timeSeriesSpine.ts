import { toEpochMilliseconds } from './calendarDate';
import { toInstant } from './instant';
import { Period } from './period';
import { formatBucketKey } from './sectionGrain';
import type { SectionRange } from './sectionRange';

interface SeriesBucket {
  period: string;
  values: (number | null)[];
}

interface SpineBucket extends SeriesBucket {
  timestamp: number;
}

function dateBucketInstant(date: string, timeZone: string) {
  return (
    toInstant(date, 0, timeZone) ??
    Array.from({ length: 23 }, (_, index) =>
      toInstant(date, index + 1, timeZone)
    ).find((instant) => instant !== null) ??
    null
  );
}

export function timeSeriesSpine(
  range: SectionRange,
  buckets: SeriesBucket[],
  measureCount: number,
  timeZone: string
): SpineBucket[] {
  const bucketsByPeriod = new Map(
    buckets.map((bucket) => [bucket.period, bucket])
  );
  const starts =
    range.grain === 'hour'
      ? Array.from(
          {
            length:
              Math.round(
                (toEpochMilliseconds(range.display.last.date) +
                  range.display.last.hour * 3_600_000 -
                  toEpochMilliseconds(range.display.first.date) -
                  range.display.first.hour * 3_600_000) /
                  3_600_000
              ) + 1,
          },
          (_, index) => {
            const date = new Date(
              toEpochMilliseconds(range.display.first.date) +
                (range.display.first.hour + index) * 3_600_000
            );
            return {
              date: date.toISOString().slice(0, 10),
              hour: date.getUTCHours(),
            };
          }
        )
      : (() => {
          const first = Period.containing(
            range.grain,
            range.display.first.date
          );
          const last = Period.containing(range.grain, range.display.last.date);
          if (first === null || last === null) {
            throw new Error('Invalid display range');
          }
          return Array.from(
            { length: first.distanceTo(last) + 1 },
            (_, index) => ({
              date: first.shift(index).firstDate,
              hour: 0,
            })
          );
        })();

  return starts.flatMap((start) => {
    const timestamp =
      range.grain === 'hour'
        ? toInstant(start.date, start.hour, timeZone)
        : dateBucketInstant(start.date, timeZone);
    if (timestamp === null) {
      return [];
    }
    const period = formatBucketKey(range.grain, start);
    return [
      {
        period,
        timestamp,
        values:
          bucketsByPeriod.get(period)?.values ??
          Array.from({ length: measureCount }, () => null),
      },
    ];
  });
}
