import type { MatrixHeatmapSection } from '../../modules/dashboard/domain';
import {
  addDays,
  type CategoryValue,
  categoryLabels,
  type DashboardDefinition,
  type DashboardLabels,
  DEFAULT_DASHBOARD_LABELS,
  differenceInDays,
  type MatrixAxis,
  type Period,
  resolveMatrixRange,
  toEpochMilliseconds,
} from '../../modules/dashboard/domain';
import type { DateBounds } from '../../modules/dashboard/domain/period';
import type { MatrixData } from '../../modules/dashboard/use-cases';

export interface MatrixGridInput {
  rows: string[];
  columns: string[];
  values: (number | null)[][];
}

interface AxisContext {
  dateRange: DateBounds;
  locale: string;
  labels: DashboardLabels;
  sectionId: string;
}

function axisEntries(
  axis: MatrixAxis,
  categories: CategoryValue[] | null,
  context: AxisContext
) {
  if (axis.axis === 'hour') {
    return Array.from({ length: 24 }, (_, hour) => {
      const key = String(hour).padStart(2, '0');
      return { key, label: key };
    });
  }
  if (axis.axis === 'date') {
    const formatter = new Intl.DateTimeFormat(context.locale, {
      calendar: 'gregory',
      month: 'numeric',
      day: 'numeric',
      timeZone: 'UTC',
    });
    const { firstDate, lastDate } = context.dateRange;
    return Array.from(
      { length: differenceInDays(firstDate, lastDate) + 1 },
      (_, index) => {
        const key = addDays(firstDate, index);
        return { key, label: formatter.format(toEpochMilliseconds(key)) };
      }
    );
  }
  if (categories === null) {
    throw new Error('A category axis requires its categories');
  }
  const labels = categoryLabels(
    categories.map((category) => ({ category, rank: null, values: [] })),
    null,
    context.labels,
    { sectionId: context.sectionId }
  );
  return categories.map((category, index) => ({
    key: category,
    label: labels[index],
  }));
}

// Category labels may collide with the null label; keep this inside the logged load boundary.
export function matrixGrid(
  section: MatrixHeatmapSection,
  data: Extract<MatrixData, { status: 'ready' }>,
  period: Period,
  dashboard: DashboardDefinition
): MatrixGridInput {
  const context = {
    dateRange: resolveMatrixRange(section, period),
    locale: dashboard.locale,
    labels: { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels },
    sectionId: section.id,
  };
  const rows = axisEntries(section.rows, data.rowCategories, context);
  const columns = axisEntries(section.columns, data.columnCategories, context);
  const valueByCell = new Map(
    data.cells.map((cell) => [
      JSON.stringify([cell.row, cell.column]),
      cell.value,
    ])
  );
  return {
    rows: rows.map((entry) => entry.label),
    columns: columns.map((entry) => entry.label),
    values: rows.map((row) =>
      columns.map(
        (column) =>
          valueByCell.get(JSON.stringify([row.key, column.key])) ?? null
      )
    ),
  };
}
