import {
  type CategoryItem,
  CELL_BUDGET,
  categoryItemsFromBuckets,
  categoryLabels,
  compareCategoryValues,
  type DashboardDefinition,
  DEFAULT_DASHBOARD_LABELS,
  orderCategories,
  Period,
  type PivotTableSection,
  resolveSectionRange,
  selectTopN,
  timeSeriesSpine,
} from '../../modules/dashboard/domain';
import type { PivotCells } from '../../modules/dashboard/use-cases';

export interface PivotTableGrid {
  status: 'ready';
  columnHeaders: string[];
  rows: { label: string; values: (number | null)[]; total: number | null }[];
  columnTotals: (number | null)[];
  grandTotal: number | null;
}

export type PivotTableInput = PivotTableGrid | { status: 'over-budget' };

function sum(values: (number | null)[]) {
  const measured = values.filter((value): value is number => value !== null);
  return measured.length === 0
    ? null
    : measured.reduce((total, value) => total + value, 0);
}

function orderRows(
  items: CategoryItem[],
  order: PivotTableSection['rows']['order']
) {
  if (order === 'total-desc') return orderCategories(items, 'value-desc');
  if (order === 'as-provided') {
    return [...items].sort((first, second) =>
      compareCategoryValues(first.category, second.category)
    );
  }
  return orderCategories(items, order);
}

// Label collisions need the section's logged load boundary.
export function pivotTable(
  section: PivotTableSection,
  data: PivotCells,
  period: Period,
  dashboard: DashboardDefinition
): PivotTableInput {
  if (data.exceeded) return { status: 'over-budget' };
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  const context = { sectionId: section.id };
  const grain =
    section.columns.axis === 'time'
      ? (section.columns.grain ?? period.grain)
      : period.grain;
  const columnKeys =
    section.columns.axis === 'time'
      ? timeSeriesSpine(
          resolveSectionRange(
            { grain, window: section.columns.window },
            period
          ),
          [],
          0,
          dashboard.timeZone
        ).map((bucket) => bucket.period)
      : Array.from(new Set(data.cells.map((cell) => cell.column))).sort(
          compareCategoryValues
        );
  const rowCount = new Set(data.cells.map((cell) => cell.row)).size;
  const topN = section.rows.topN;
  const displayedRowCount =
    topN === undefined
      ? rowCount
      : Math.min(rowCount, topN.count) + Number(rowCount > topN.count);
  // Check before building row items, whose size is rows × columns.
  if (displayedRowCount * columnKeys.length > CELL_BUDGET)
    return { status: 'over-budget' };
  const sortKeys = new Map(
    data.cells.map((cell) => [cell.row, cell.sortKey ?? null])
  );
  const items = categoryItemsFromBuckets(
    columnKeys.map((key) => ({
      period: key ?? '',
      cells: data.cells
        .filter((cell) => cell.column === key)
        .map((cell) => ({ category: cell.row, values: [cell.value] })),
    }))
  ).map((item) => ({ ...item, sortKey: sortKeys.get(item.category) ?? null }));
  const columnHeaders =
    section.columns.axis === 'time'
      ? columnKeys.map(
          (key) =>
            Period.parse(grain, key ?? '')?.label(dashboard.locale) ?? key ?? ''
        )
      : categoryLabels(
          columnKeys.map((category) => ({ category, rank: null, values: [] })),
          null,
          labels,
          context
        );
  categoryLabels(items, section.rows.topN?.otherLabel ?? null, labels, context);
  const selection =
    section.rows.topN === undefined
      ? { kept: items, remainder: null }
      : selectTopN(items, section.rows.topN.count);
  const ordered = orderRows(selection.kept, section.rows.order);
  const rowLabels = categoryLabels(
    ordered,
    selection.remainder === null
      ? null
      : (section.rows.topN?.otherLabel ?? null),
    labels,
    context
  );
  const displayedValues = [
    ...ordered.map((item) => item.values),
    ...(selection.remainder === null ? [] : [selection.remainder]),
  ];
  const rows = displayedValues.map((values, index) => ({
    label: rowLabels[index],
    values,
    total: sum(values),
  }));
  const columnTotals = columnKeys.map((_, index) =>
    sum(displayedValues.map((values) => values[index] ?? null))
  );
  const grandTotal = sum(rows.map((row) => row.total));
  return { status: 'ready', columnHeaders, rows, columnTotals, grandTotal };
}
