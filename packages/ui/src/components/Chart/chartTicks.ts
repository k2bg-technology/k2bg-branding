import { ChartPeriod } from './types';

const tickTargetCount: Record<ChartPeriod, number> = {
  day: 6,
  week: 7,
  month: 6,
  quarter: 4,
  year: 6,
};

function padTwoDigits(value: number): string {
  return String(value).padStart(2, '0');
}

/** Locale-neutral numeric formats, fixed to UTC for determinism. */
export function formatTimestamp(
  timestamp: number,
  period: ChartPeriod
): string {
  const date = new Date(timestamp);
  switch (period) {
    case ChartPeriod.DAY:
      return `${padTwoDigits(date.getUTCHours())}:${padTwoDigits(date.getUTCMinutes())}`;
    case ChartPeriod.WEEK:
    case ChartPeriod.MONTH:
    case ChartPeriod.QUARTER:
      return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
    case ChartPeriod.YEAR:
      return `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}`;
  }
}

export function getTimeAxisTicks(
  timestamps: number[],
  period: ChartPeriod
): { ticks: number[]; formatTick: (timestamp: number) => string } {
  const sorted = Array.from(new Set(timestamps)).sort(
    (first, second) => first - second
  );
  const step = Math.max(1, Math.ceil(sorted.length / tickTargetCount[period]));
  const ticks = sorted.filter((_, index) => index % step === 0);

  return {
    ticks,
    formatTick: (timestamp) => formatTimestamp(timestamp, period),
  };
}

export function defaultValueFormatter(value: number): string {
  return String(value);
}
