import type {
  MovingAverageDefinition,
  RebaseDefinition,
  RunningAggregateDefinition,
  TimeSeriesPivot,
  TimeSeriesSeriesDefinition,
} from '../definition';
import {
  layoutWideSeries,
  type RebaseSlot,
  type SeriesSlot,
} from '../query-plan';
import type { PivotBucket, WidenedPivot } from './widenPivot';

export type RebaseBase =
  | { layout: 'wide'; values: (number | null)[] }
  | { layout: 'pivot'; bucket: PivotBucket };

function rebaseSlot(
  normalize: RebaseDefinition,
  fixedValue: number | null | undefined
) {
  if (normalize.base === undefined || normalize.base === 'first') {
    return { base: 'first' } satisfies RebaseSlot;
  }
  return { base: 'fixed', value: fixedValue ?? null } satisfies RebaseSlot;
}

export function wideSeriesSlots(
  series: TimeSeriesSeriesDefinition[],
  base: RebaseBase | null | undefined
): SeriesSlot[] {
  if (base != null && base.layout !== 'wide') {
    throw new Error('A wide section reads a wide base');
  }
  const values = base?.values;
  return layoutWideSeries(series).slots.map((slot, index) => {
    const definition = series[index];
    if (
      slot.kind === 'band' ||
      !('column' in definition) ||
      definition.normalize === undefined
    )
      return slot;
    return {
      ...slot,
      rebase: rebaseSlot(definition.normalize, values?.[slot.valueIndex]),
    };
  });
}

export function pivotBaseBucket(
  base: RebaseBase | null | undefined
): PivotBucket | null | undefined {
  if (base === undefined) return undefined;
  if (base === null) return null;
  if (base.layout === 'pivot') return base.bucket;
  throw new Error('A pivot section reads a pivot base');
}

function templated<
  Definition extends MovingAverageDefinition | RunningAggregateDefinition,
>(definition: Definition | undefined, name: string) {
  return definition === undefined
    ? undefined
    : { ...definition, label: definition.label.split('{category}').join(name) };
}

export function pivotSeriesSlots(
  pivot: TimeSeriesPivot,
  widened: Extract<WidenedPivot, { status: 'ready' }>
): SeriesSlot[] {
  return widened.series.map((series, index) => ({
    kind: 'line',
    id: series.id,
    label: series.label,
    interpolation: pivot.interpolation,
    valueIndex: index,
    movingAverage: templated(pivot.movingAverage, series.label),
    running: templated(pivot.running, series.label),
    rebase:
      pivot.normalize === undefined
        ? undefined
        : rebaseSlot(pivot.normalize, widened.baseValues?.[index]),
  }));
}
