import { DataTable, type DataTableColumn, type DataTableRow } from 'ui';

import {
  type DashboardDefinition,
  DEFAULT_DASHBOARD_LABELS,
  serializeUrlState,
  type TableAlignment,
  type TableColumnDefinition,
  type TableColumnType,
  type TableSection as TableSectionDefinition,
  toEpochMilliseconds,
  type UrlState,
  withPage,
} from '../../../modules/dashboard/domain';
import type {
  TableCell,
  TableRows,
} from '../../../modules/dashboard/use-cases';
import { formatValue, NULL_VALUE } from '../formatValue';
import { TablePagination } from '../TablePagination';

interface Props {
  dashboard: DashboardDefinition;
  section: TableSectionDefinition;
  data: TableRows;
  urlState: UrlState;
}

const defaultAlignmentByType: Record<TableColumnType, TableAlignment> = {
  text: 'start',
  number: 'end',
  date: 'start',
  timestamp: 'start',
};

function formatCell(
  cell: TableCell,
  column: TableColumnDefinition,
  dashboard: DashboardDefinition
): string {
  if (cell === null) {
    return NULL_VALUE;
  }
  if (column.type === 'number') {
    if (typeof cell !== 'number') {
      throw new Error('Number column requires a number cell');
    }
    return formatValue(cell, column, dashboard);
  }
  if (column.type === 'date') {
    if (typeof cell !== 'string') {
      throw new Error('Date column requires a date cell');
    }
    return new Intl.DateTimeFormat(dashboard.locale, {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(toEpochMilliseconds(cell));
  }
  if (column.type === 'timestamp') {
    if (typeof cell !== 'number') {
      throw new Error('Timestamp column requires a number cell');
    }
    return new Intl.DateTimeFormat(dashboard.locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: dashboard.timeZone,
    }).format(cell);
  }
  if (typeof cell !== 'string') {
    throw new Error('Text column requires a string cell');
  }
  return cell;
}

export function TableSection({ dashboard, section, data, urlState }: Props) {
  const columns: DataTableColumn[] = section.columns.map((column, index) => ({
    id: `column-${index}`,
    header: column.header,
    align: column.alignment ?? defaultAlignmentByType[column.type],
  }));
  const rows: DataTableRow[] = data.rows.map((cells, rowIndex) => ({
    id: `row-${rowIndex}`,
    cells: Object.fromEntries(
      cells.map((cell, index) => [
        `column-${index}`,
        formatCell(cell, section.columns[index], dashboard),
      ])
    ),
  }));
  const labels = { ...DEFAULT_DASHBOARD_LABELS, ...dashboard.labels };
  const query = serializeUrlState(withPage(urlState, section.id, 1));
  return (
    <>
      <DataTable
        caption={section.title}
        visuallyHiddenCaption
        columns={columns}
        rows={rows}
        emptyMessage={section.emptyMessage}
      />
      {data.page !== null && data.page.count > 1 && (
        <TablePagination
          pageCount={data.page.count}
          currentPage={data.page.number}
          path={`/dashboards/${dashboard.id}`}
          query={query}
          pageKey={`page.${section.id}`}
          labels={{
            previousPage: labels.previousPage,
            nextPage: labels.nextPage,
            pagination: labels.pagination,
          }}
        />
      )}
    </>
  );
}
