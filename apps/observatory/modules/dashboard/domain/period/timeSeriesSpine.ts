import { Period } from './period';

export function timeSeriesSpine(
  selectedPeriod: Period,
  window: number,
  buckets: { period: string; values: (number | null)[] }[],
  truncated: boolean
): { period: Period; values: (number | null)[] }[] {
  const requestedFirst = selectedPeriod.shift(-(window - 1));
  const firstPeriod =
    truncated && buckets[0] !== undefined
      ? (Period.parse(buckets[0].period) ?? requestedFirst)
      : requestedFirst;
  const monthCount =
    (selectedPeriod.year - firstPeriod.year) * 12 +
    selectedPeriod.month -
    firstPeriod.month +
    1;
  const bucketsByPeriod = new Map(
    buckets.map((bucket) => [bucket.period, bucket])
  );
  const measureCount = buckets[0]?.values.length ?? 0;
  return Array.from({ length: monthCount }, (_, index) => {
    const period = firstPeriod.shift(index);
    return {
      period,
      values:
        bucketsByPeriod.get(period.toString())?.values ??
        Array.from({ length: measureCount }, () => null),
    };
  });
}
