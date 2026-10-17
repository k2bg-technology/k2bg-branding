import type {
  DonutChartSlice,
  TreemapChartNode,
  TreemapChartTableHeaders,
} from 'ui';

import {
  type CategoryItem,
  type CategoryOrder,
  categoryLabels,
  compareCategoryValues,
  type DashboardDefinition,
  DEFAULT_DASHBOARD_LABELS,
  type DonutSection,
  orderCategories,
  selectTopN,
  type TopN,
  type TreemapSection,
} from '../../modules/dashboard/domain';
import type {
  CompositionData,
  CompositionPart,
} from '../../modules/dashboard/use-cases';
import { formatValue, NULL_VALUE } from './formatValue';

export interface DonutChartInput {
  slices: DonutChartSlice[];
  centerValue: string;
  centerLabel?: string;
}

export interface TreemapChartInput {
  nodes: TreemapChartNode[];
  tableHeaders: TreemapChartTableHeaders;
}

export type CompositionChart<Chart> =
  | { status: 'empty' }
  | { status: 'negative' }
  | { status: 'ready'; chart: Chart };

function hasNegativePart(parts: CompositionPart[]) {
  return parts.some((part) => part.value !== null && part.value < 0);
}

function toItem(part: CompositionPart): CategoryItem {
  return {
    category: part.category,
    rank: part.value,
    sortKey: part.sortKey,
    values: [part.value],
  };
}

function drawnParts(
  items: CategoryItem[],
  order: CategoryOrder,
  topN: TopN | undefined,
  labels: { nullCategory: string },
  context: { sectionId: string }
): { id: string; label: string; value: number }[] {
  categoryLabels(items, topN?.otherLabel ?? null, labels, context);
  const selection =
    topN === undefined
      ? { kept: items, remainder: null }
      : selectTopN(items, topN.count);
  const ordered = orderCategories(selection.kept, order);
  const names = categoryLabels(
    ordered,
    selection.remainder === null ? null : (topN?.otherLabel ?? null),
    labels,
    context
  );
  const amounts = [
    ...ordered.map((item) => item.values[0] ?? null),
    ...(selection.remainder === null ? [] : [selection.remainder[0] ?? null]),
  ];
  return names.flatMap((label, index) => {
    const amount = amounts[index];
    return amount === null || amount === undefined
      ? []
      : [
          {
            id: index < ordered.length ? `category-${index}` : 'remainder',
            label,
            value: amount,
          },
        ];
  });
}

export function donutChart(
  section: DonutSection,
  data: CompositionData,
  dashboard: DashboardDefinition
): CompositionChart<DonutChartInput> {
  if (hasNegativePart(data.parts)) return { status: 'negative' };
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  const slices = drawnParts(
    data.parts.map(toItem),
    section.order,
    section.topN,
    labels,
    { sectionId: section.id }
  );
  if (slices.every((slice) => slice.value === 0)) return { status: 'empty' };
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const center = section.centerColumn === undefined ? total : data.center;
  return {
    status: 'ready',
    chart: {
      slices,
      centerValue:
        center === null ? NULL_VALUE : formatValue(center, section, dashboard),
      centerLabel: section.centerLabel,
    },
  };
}

export function treemapChart(
  section: TreemapSection,
  data: CompositionData,
  dashboard: DashboardDefinition
): CompositionChart<TreemapChartInput> {
  if (hasNegativePart(data.parts)) return { status: 'negative' };
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  const context = { sectionId: section.id };
  const groups = Array.from(
    new Set(data.parts.map((part) => part.group ?? null))
  )
    .map((group) => {
      const items = data.parts
        .filter((part) => (part.group ?? null) === group)
        .map(toItem);
      const parts = drawnParts(
        items,
        'value-desc',
        section.topN,
        labels,
        context
      );
      return {
        group,
        parts,
        total: parts.reduce((sum, part) => sum + part.value, 0),
      };
    })
    .sort(
      (first, second) =>
        second.total - first.total ||
        compareCategoryValues(first.group, second.group)
    );
  const groupNames =
    section.group === undefined
      ? []
      : categoryLabels(
          groups.map(({ group, total }) => ({
            category: group,
            rank: total,
            values: [],
          })),
          null,
          labels,
          context
        );
  const nodes = groups.flatMap(({ parts }, groupIndex) =>
    parts.map((part) => ({
      id:
        section.group === undefined
          ? part.id
          : `group-${groupIndex}-${part.id}`,
      label: part.label,
      value: part.value,
      ...(section.group === undefined ? {} : { group: groupNames[groupIndex] }),
    }))
  );
  if (nodes.every((node) => node.value === 0)) return { status: 'empty' };
  return {
    status: 'ready',
    chart: {
      nodes,
      tableHeaders: {
        group: section.groupLabel,
        label: section.categoryLabel,
        value: section.value.label,
        share: labels.share,
      },
    },
  };
}
