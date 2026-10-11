import { DataTable, type DataTableColumn, type DataTableRow } from 'ui';

import {
  type DashboardDefinition,
  DEFAULT_DASHBOARD_LABELS,
  type PivotTableSection as PivotTableSectionDefinition,
} from '../../../modules/dashboard/domain';
import { formatValue, NULL_VALUE } from '../formatValue';
import type { PivotTableInput } from '../pivotTable';

interface Props {
  dashboard: DashboardDefinition;
  section: PivotTableSectionDefinition;
  table: PivotTableInput;
}

const ROW_LABEL_COLUMN_ID = 'row-label';
const TOTAL_COLUMN_ID = 'total';

export function PivotTableSection({ dashboard, section, table }: Props) {
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  if (table.status === 'over-budget') {
    return (
      <p className="text-body-r-sm text-base-black/80">
        {labels.cellBudgetExceeded}
      </p>
    );
  }
  const display = { format: section.format, unit: section.unit };
  const formatCell = (value: number | null) =>
    value === null ? NULL_VALUE : formatValue(value, display, dashboard);
  const totalsColumn = section.totals?.column;
  const columns: DataTableColumn[] = [
    { id: ROW_LABEL_COLUMN_ID, header: section.rows.label },
    ...table.columnHeaders.map((header, index) => ({
      id: `column-${index}`,
      header,
      align: 'end' as const,
    })),
    ...(totalsColumn === undefined
      ? []
      : [
          {
            id: TOTAL_COLUMN_ID,
            header: totalsColumn,
            align: 'end' as const,
            emphasis: true,
          },
        ]),
  ];
  const cellsOf = (
    label: string,
    values: (number | null)[],
    total: number | null
  ) => ({
    [ROW_LABEL_COLUMN_ID]: label,
    ...Object.fromEntries(
      values.map((value, index) => [`column-${index}`, formatCell(value)])
    ),
    ...(totalsColumn === undefined
      ? {}
      : { [TOTAL_COLUMN_ID]: formatCell(total) }),
  });
  const rows: DataTableRow[] = table.rows.map((row, index) => ({
    id: `row-${index}`,
    cells: cellsOf(row.label, row.values, row.total),
  }));
  const footer =
    section.totals?.row === undefined
      ? undefined
      : cellsOf(section.totals.row, table.columnTotals, table.grandTotal);
  return (
    <DataTable
      caption={section.title}
      visuallyHiddenCaption
      stickyFirstColumn
      columns={columns}
      rows={rows}
      footer={footer}
    />
  );
}
