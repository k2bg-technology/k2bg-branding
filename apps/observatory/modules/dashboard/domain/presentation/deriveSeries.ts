import type { SeriesSlot } from '../query-plan';

export function movingAverage(
  values: (number | null)[],
  window: number,
  minimumPoints: number
): (number | null)[] {
  return values.map((current, index) => {
    const measured = values
      .slice(Math.max(0, index - window + 1), index + 1)
      .filter((value) => value !== null);
    // A bucket without a value stays a gap so the overlay never bridges it.
    return current === null || measured.length < minimumPoints
      ? null
      : measured.reduce((total, value) => total + value, 0) / measured.length;
  });
}

export function runningSum(values: (number | null)[]): (number | null)[] {
  return values.reduce<{ total: number | null; output: (number | null)[] }>(
    ({ total, output }, value) => {
      const next = value === null ? total : (total ?? 0) + value;
      return { total: next, output: [...output, next] };
    },
    { total: null, output: [] }
  ).output;
}

export function runningAverage(values: (number | null)[]): (number | null)[] {
  return values.reduce<{
    sum: number;
    count: number;
    output: (number | null)[];
  }>(
    ({ sum, count, output }, value) => {
      const nextSum = sum + (value ?? 0);
      const nextCount = count + (value === null ? 0 : 1);
      const average = nextCount === 0 ? null : nextSum / nextCount;
      return { sum: nextSum, count: nextCount, output: [...output, average] };
    },
    { sum: 0, count: 0, output: [] }
  ).output;
}

export function rebase(
  values: (number | null)[],
  base: number | null
): (number | null)[] {
  if (base === null || !Number.isFinite(base) || base === 0) {
    return values.map(() => null);
  }
  return values.map((value) => (value === null ? null : (value * 100) / base));
}

export function firstMeasured(values: (number | null)[]): number | null {
  return values.find((value) => value !== null) ?? null;
}

export interface DerivedLineSeries {
  id: string;
  label: string;
  /** Drawn dashed: a line read against its source, not a measurement of its own. */
  overlay: boolean;
  values: (number | null)[];
}

export function deriveLineSeries(
  slot: Extract<SeriesSlot, { kind: 'line' }>,
  values: (number | null)[],
  warmUpCount: number,
  stacked: boolean
): DerivedLineSeries[] {
  const displayed = values.slice(warmUpCount);
  const average =
    slot.movingAverage === undefined
      ? null
      : movingAverage(
          values,
          slot.movingAverage.window,
          slot.movingAverage.minimumPoints ?? slot.movingAverage.window
        ).slice(warmUpCount);
  const running =
    slot.running === undefined
      ? null
      : { sum: runningSum, average: runningAverage }[slot.running.kind](
          displayed
        );
  const base = (() => {
    if (slot.rebase === undefined) return null;
    if (slot.rebase.base === 'first') return firstMeasured(displayed);
    return slot.rebase.value;
  })();
  const scale = (series: (number | null)[]) =>
    slot.rebase === undefined ? series : rebase(series, base);
  const drawsSource = !(stacked && slot.running !== undefined);
  return [
    ...(drawsSource
      ? [
          {
            id: slot.id,
            label: slot.label,
            overlay: false,
            values: scale(displayed),
          },
        ]
      : []),
    ...(average === null || slot.movingAverage === undefined
      ? []
      : [
          {
            id: `${slot.id}-moving-average`,
            label: slot.movingAverage.label,
            overlay: true,
            values: scale(average),
          },
        ]),
    ...(running === null || slot.running === undefined
      ? []
      : [
          {
            id: `${slot.id}-running`,
            label: slot.running.label,
            overlay: !stacked,
            values: scale(running),
          },
        ]),
  ];
}
