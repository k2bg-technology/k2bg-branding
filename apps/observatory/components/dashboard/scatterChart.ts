import type { ScatterChartSeries, ScatterChartTrendLine } from 'ui';

import {
  categoryLabels,
  compareCategoryValues,
  type DashboardDefinition,
  DEFAULT_DASHBOARD_LABELS,
  type ScatterSection,
} from '../../modules/dashboard/domain';
import type {
  ScatterData,
  ScatterPoint,
} from '../../modules/dashboard/use-cases';

export interface ScatterChartInput {
  series: ScatterChartSeries[];
  trendLine: ScatterChartTrendLine | null;
  truncated: boolean;
}

export function scatterChart(
  section: ScatterSection,
  data: ScatterData,
  dashboard: DashboardDefinition
): ScatterChartInput {
  const seriesOf = (point: ScatterPoint) =>
    section.series === undefined ? null : (point.series ?? null);
  const categories = Array.from(new Set(data.points.map(seriesOf))).sort(
    compareCategoryValues
  );
  const names =
    section.series === undefined
      ? [section.y.label]
      : categoryLabels(
          categories.map((category) => ({ category, rank: null, values: [] })),
          null,
          { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels },
          { sectionId: section.id }
        );
  return {
    series: categories.map((category, index) => ({
      id: `series-${index}`,
      label: names[index],
      points: data.points
        .filter((point) => seriesOf(point) === category)
        .map(({ x, y }) => ({ x, y })),
    })),
    trendLine: data.trendLine,
    truncated: data.truncated,
  };
}
