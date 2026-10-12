import type { BarSeries } from 'ui';

import {
  type BarsAxis,
  type BarsSection,
  type CategoryItem,
  categoryLabels,
  type DashboardDefinition,
  DEFAULT_DASHBOARD_LABELS,
  formatPeriodRange,
  MAXIMUM_PIVOT_SERIES,
  orderCategories,
  Period,
  resolveSectionRange,
  selectTopN,
  timeSeriesSpine,
  widenPivot,
} from '../../modules/dashboard/domain';
import type { GroupedValues } from '../../modules/dashboard/use-cases';

export interface BarsChartInput {
  categories: string[];
  series: BarSeries[];
  windowLabel: string | null;
  truncated: boolean;
}

function timeAxis(
  axis: Extract<BarsAxis, { axis: 'time' }>,
  buckets: { period: string; values: (number | null)[] }[],
  measureCount: number,
  truncated: boolean,
  period: Period,
  dashboard: DashboardDefinition
) {
  const grain = axis.grain ?? period.grain;
  const range = resolveSectionRange({ grain, window: axis.window }, period, {
    truncated,
    firstBucket: buckets[0]?.period,
  });
  const spine = timeSeriesSpine(
    range,
    buckets,
    measureCount,
    dashboard.timeZone
  );
  const first = Period.containing(grain, range.display.first.date);
  const last = Period.containing(grain, range.display.last.date);
  if (first === null || last === null)
    throw new Error('Time bars require a valid range');
  return {
    categories: spine.map(
      (bucket) =>
        Period.parse(grain, bucket.period)?.label(dashboard.locale) ??
        bucket.period
    ),
    spine,
    windowLabel: formatPeriodRange(first, last, dashboard.locale),
  };
}

// Labels can collide with any category value, folded ones included, so check them inside the section's logged load boundary.
export function barsChart(
  section: BarsSection,
  data: GroupedValues,
  period: Period,
  dashboard: DashboardDefinition
): BarsChartInput {
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  if (data.grouping === 'category') {
    if (section.x.axis !== 'category' || section.series === undefined)
      throw new Error('Category bars require series');
    const rankingColumn = section.x.by;
    const rankIndex =
      rankingColumn === undefined
        ? 0
        : section.series.findIndex((series) => series.column === rankingColumn);
    const items: CategoryItem[] = data.groups.map((group) => ({
      ...group,
      rank: group.values[rankIndex] ?? null,
    }));
    categoryLabels(items, section.x.topN?.otherLabel ?? null, labels, {
      sectionId: section.id,
    });
    const selection =
      section.x.topN === undefined
        ? { kept: items, remainder: null }
        : selectTopN(items, section.x.topN.count);
    const ordered = orderCategories(selection.kept, section.x.order);
    const categories = categoryLabels(
      ordered,
      selection.remainder === null
        ? null
        : (section.x.topN?.otherLabel ?? null),
      labels,
      { sectionId: section.id }
    );
    const series = section.series.map((binding, index) => ({
      id: `series-${index}`,
      label: binding.label,
      values: [
        ...ordered.map((item) => item.values[index] ?? null),
        ...(selection.remainder === null
          ? []
          : [selection.remainder[index] ?? null]),
      ],
    }));
    return { categories, series, windowLabel: null, truncated: false };
  }

  if (section.x.axis !== 'time')
    throw new Error('Time bars require a time axis');
  if (data.grouping === 'period') {
    if (section.series === undefined)
      throw new Error('Time bars require series');
    const axis = timeAxis(
      section.x,
      data.buckets,
      section.series.length,
      data.truncated,
      period,
      dashboard
    );
    return {
      categories: axis.categories,
      series: section.series.map((binding, index) => ({
        id: `series-${index}`,
        label: binding.label,
        values: axis.spine.map((bucket) => bucket.values[index] ?? null),
      })),
      windowLabel: axis.windowLabel,
      truncated: data.truncated,
    };
  }

  if (section.pivot === undefined)
    throw new Error('Pivot bars require a pivot');
  const widened = widenPivot(
    data.buckets,
    { topN: section.pivot.topN, maximum: MAXIMUM_PIVOT_SERIES },
    labels,
    { sectionId: section.id }
  );
  if (widened.status !== 'ready')
    throw new Error('A bars pivot folds categories into topN');
  const axis = timeAxis(
    section.x,
    widened.buckets,
    widened.series.length,
    data.truncated,
    period,
    dashboard
  );
  return {
    categories: axis.categories,
    series: widened.series.map(({ id, label }, index) => ({
      id,
      label,
      values: axis.spine.map((bucket) => bucket.values[index] ?? null),
    })),
    windowLabel: axis.windowLabel,
    truncated: data.truncated,
  };
}
