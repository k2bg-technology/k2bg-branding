import type {
  SeriesInterpolation,
  TimeSeriesSection,
  TimeSeriesSeriesDefinition,
} from '../definition';
import { type Period, resolveSectionRange } from '../period';
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
  const common = {
    kind: section.kind,
    sectionId: section.id,
    source: section.source,
    timeZone,
    selectedPeriod: period.toString(),
    dateRange: range.dateRange,
    measures: layoutWideSeries(section.series).measures,
    bucketLimit: MAXIMUM_SECTION_BUCKETS,
  };
  return range.grain === 'hour'
    ? { ...common, grain: range.grain, firstHour: range.firstHour }
    : { ...common, grain: range.grain };
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
  const bucketLimit = MAXIMUM_SECTION_BUCKETS;
  return {
    sectionId: section.id,
    source: section.source,
    timeZone,
    dateRange: range.dateRange,
    measures: [section.pivot.value],
    buckets:
      range.grain === 'hour'
        ? { grain: range.grain, firstHour: range.firstHour, bucketLimit }
        : { grain: range.grain, bucketLimit },
    category: { column: section.pivot.column, sortKey: null },
  };
}
