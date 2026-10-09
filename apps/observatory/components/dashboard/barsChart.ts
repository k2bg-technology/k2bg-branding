import type { BarSeries } from 'ui';

import {
  type BarsSection,
  type CategoryItem,
  categoryItemsFromBuckets,
  categoryLabels,
  type DashboardDefinition,
  DEFAULT_DASHBOARD_LABELS,
  formatPeriodRange,
  orderCategories,
  Period,
  resolveSectionRange,
  selectTopN,
  timeSeriesSpine,
} from '../../modules/dashboard/domain';
import type { GroupedValues } from '../../modules/dashboard/use-cases';

export interface BarsChartInput {
  categories: string[];
  series: BarSeries[];
  windowLabel: string | null;
  truncated: boolean;
}

function timeAxis(
  window: number,
  buckets: { period: string; values: (number | null)[] }[],
  measureCount: number,
  truncated: boolean,
  period: Period,
  dashboard: DashboardDefinition
) {
  const range = resolveSectionRange({ window }, period, {
    truncated,
    firstBucket: buckets[0]?.period,
  });
  const spine = timeSeriesSpine(
    range,
    buckets,
    measureCount,
    dashboard.timeZone
  );
  const first = Period.containing(period.grain, range.display.first.date);
  const last = Period.containing(period.grain, range.display.last.date);
  if (first === null || last === null)
    throw new Error('Time bars require a valid range');
  return {
    categories: spine.map(
      (bucket) =>
        Period.parse(period.grain, bucket.period)?.label(dashboard.locale) ??
        bucket.period
    ),
    spine,
    windowLabel: formatPeriodRange(first, last, dashboard.locale),
  };
}

// Labels can collide with category values, so build them inside the section's logged load boundary.
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
      section.x.window,
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
  const items = categoryItemsFromBuckets(data.buckets);
  const { kept, remainder } = selectTopN(items, section.pivot.topN.count);
  const seriesLabels = categoryLabels(
    kept,
    remainder === null ? null : section.pivot.topN.otherLabel,
    labels,
    { sectionId: section.id }
  );
  const wideBuckets = data.buckets.map((bucket, index) => ({
    period: bucket.period,
    values: [
      ...kept.map((item) => item.values[index] ?? null),
      ...(remainder === null ? [] : [remainder[index] ?? null]),
    ],
  }));
  const axis = timeAxis(
    section.x.window,
    wideBuckets,
    seriesLabels.length,
    data.truncated,
    period,
    dashboard
  );
  return {
    categories: axis.categories,
    series: seriesLabels.map((label, index) => ({
      id: index < kept.length ? `category-${index}` : 'remainder',
      label,
      values: axis.spine.map((bucket) => bucket.values[index] ?? null),
    })),
    windowLabel: axis.windowLabel,
    truncated: data.truncated,
  };
}
