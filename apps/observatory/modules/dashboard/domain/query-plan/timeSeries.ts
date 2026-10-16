import type {
  MovingAverageDefinition,
  RunningAggregateDefinition,
  SeriesInterpolation,
  TimeSeriesSection,
  TimeSeriesSeriesDefinition,
} from '../definition';
import { SectionKind } from '../definition';
import {
  formatBucketKey,
  Period,
  type PeriodGrain,
  resolveSectionRange,
  widenRangeBackward,
} from '../period';
import type { GroupedValuesPlan } from './groupedValues';
import type { MeasureQueryPlan, SectionQueryPlan } from './types';

export const MAXIMUM_SECTION_BUCKETS = 120;

export type SeriesSlot =
  | {
      kind: 'line';
      id: string;
      label: string;
      interpolation?: SeriesInterpolation;
      valueIndex: number;
      movingAverage?: MovingAverageDefinition;
      running?: RunningAggregateDefinition;
      rebase?: RebaseSlot;
    }
  | {
      kind: 'band';
      id: string;
      label: string;
      interpolation?: SeriesInterpolation;
      lowIndex: number;
      highIndex: number;
    };

export interface WideSeriesLayout {
  measures: MeasureQueryPlan[];
  slots: SeriesSlot[];
}

// The planner and chart use one layout so band bounds occupy matching measure positions.
export function layoutWideSeries(
  series: TimeSeriesSeriesDefinition[]
): WideSeriesLayout {
  return series.reduce<WideSeriesLayout>(
    (layout, definition, index) => {
      const id = `series-${index}`;
      const { label, interpolation } = definition;
      if ('column' in definition) {
        return {
          measures: [
            ...layout.measures,
            {
              column: definition.column,
              reduction: definition.reduction,
              transform: definition.transform,
            },
          ],
          slots: [
            ...layout.slots,
            {
              kind: 'line',
              id,
              label,
              interpolation,
              valueIndex: layout.measures.length,
              movingAverage: definition.movingAverage,
              running: definition.running,
            },
          ],
        };
      }
      return {
        measures: [
          ...layout.measures,
          { column: definition.low, reduction: definition.reduction },
          { column: definition.high, reduction: definition.reduction },
        ],
        slots: [
          ...layout.slots,
          {
            kind: 'band',
            id,
            label,
            interpolation,
            lowIndex: layout.measures.length,
            highIndex: layout.measures.length + 1,
          },
        ],
      };
    },
    { measures: [], slots: [] }
  );
}

export function planTimeSeriesSection(
  section: TimeSeriesSection,
  period: Period,
  timeZone: string
): Extract<SectionQueryPlan, { kind: 'time-series' }> {
  if (section.series === undefined) {
    throw new Error(
      'A pivot time-series section is planned by planTimeSeriesPivot'
    );
  }
  const range = resolveSectionRange(section, period);
  const lookback = warmUpLookback(section);
  const fetchRange = widenRangeBackward(range, lookback);
  const warmUp =
    lookback === 0
      ? {}
      : {
          warmUp: {
            lookback,
            displayFrom: formatBucketKey(range.grain, range.display.first),
          },
        };
  const common = {
    kind: section.kind,
    sectionId: section.id,
    source: section.source,
    timeZone,
    selectedPeriod: period.toString(),
    dateRange: fetchRange.dateRange,
    measures: layoutWideSeries(section.series).measures,
    bucketLimit: MAXIMUM_SECTION_BUCKETS,
    ...warmUp,
  };
  return fetchRange.grain === 'hour'
    ? { ...common, grain: fetchRange.grain, firstHour: fetchRange.firstHour }
    : { ...common, grain: fetchRange.grain };
}

export function planTimeSeriesPivot(
  section: TimeSeriesSection,
  period: Period,
  timeZone: string
): GroupedValuesPlan {
  if (section.pivot === undefined) {
    throw new Error('A time-series pivot requires pivot');
  }
  const range = resolveSectionRange(section, period);
  const lookback = warmUpLookback(section);
  const fetchRange = widenRangeBackward(range, lookback);
  const warmUp =
    lookback === 0
      ? {}
      : {
          warmUp: {
            lookback,
            displayFrom: formatBucketKey(range.grain, range.display.first),
          },
        };
  const bucketLimit = MAXIMUM_SECTION_BUCKETS;
  return {
    sectionId: section.id,
    source: section.source,
    timeZone,
    dateRange: fetchRange.dateRange,
    measures: [section.pivot.value],
    buckets:
      fetchRange.grain === 'hour'
        ? {
            grain: fetchRange.grain,
            firstHour: fetchRange.firstHour,
            bucketLimit,
            ...warmUp,
          }
        : { grain: fetchRange.grain, bucketLimit, ...warmUp },
    category: { column: section.pivot.column, sortKey: null },
  };
}

// One source of the warm-up length for the planner and the chart.
export function warmUpLookback(section: TimeSeriesSection): number {
  const windows = [
    ...(section.series ?? []).flatMap((definition) =>
      'column' in definition && definition.movingAverage !== undefined
        ? [definition.movingAverage.window]
        : []
    ),
    ...(section.pivot?.movingAverage === undefined
      ? []
      : [section.pivot.movingAverage.window]),
  ];
  return Math.max(0, ...windows.map((window) => window - 1));
}

export function rebaseBaseDate(section: TimeSeriesSection): string | null {
  const bases = [
    ...(section.series ?? []).map((definition) =>
      'column' in definition ? definition.normalize?.base : undefined
    ),
    section.pivot?.normalize?.base,
  ];
  const fixed = bases.find((base) => typeof base === 'object');
  return fixed === undefined ? null : fixed.date;
}

export function planWideRebaseBase(
  section: TimeSeriesSection,
  grain: PeriodGrain,
  date: string,
  timeZone: string
): Extract<SectionQueryPlan, { kind: 'stat-tiles' }> {
  if (section.series === undefined)
    throw new Error('A wide base requires series');
  const bucket = Period.containing(grain, date);
  if (bucket === null) throw new Error('Invalid base date');
  return {
    kind: SectionKind.STAT_TILES,
    sectionId: section.id,
    grain,
    source: section.source,
    timeZone,
    selectedPeriod: bucket.toString(),
    dateRange: { firstDate: bucket.firstDate, lastDate: bucket.lastDate },
    measures: layoutWideSeries(section.series).measures.map((measure) => ({
      ...measure,
      compares: false,
    })),
  };
}

export function planPivotRebaseBase(
  section: TimeSeriesSection,
  grain: PeriodGrain,
  date: string,
  timeZone: string
): GroupedValuesPlan {
  if (section.pivot === undefined)
    throw new Error('A pivot base requires pivot');
  const bucket = Period.containing(grain, date);
  if (bucket === null) throw new Error('Invalid base date');
  return {
    sectionId: section.id,
    source: section.source,
    timeZone,
    dateRange: { firstDate: bucket.firstDate, lastDate: bucket.lastDate },
    measures: [section.pivot.value],
    buckets: { grain, bucketLimit: 1 },
    category: { column: section.pivot.column, sortKey: null },
  };
}

export type RebaseSlot =
  | { base: 'first' }
  | { base: 'fixed'; value: number | null };
