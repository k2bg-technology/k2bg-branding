import type {
  SortDirection,
  SourceDefinition,
  TableColumnType,
  TableSection,
  ValueTransform,
} from '../definition';
import type { Period } from '../period';
import type { DateRange } from './types';

export interface TableColumnQueryPlan {
  column: string;
  type: TableColumnType;
  transform?: ValueTransform;
}

export type TableRowBound =
  | { limit: number }
  | { pageSize: number; page: number };

export interface TableQueryPlan {
  sectionId: string;
  source: SourceDefinition;
  timeZone: string;
  dateRange: DateRange;
  columns: TableColumnQueryPlan[];
  sort: { columnIndex: number; direction: SortDirection } | null;
  rows: TableRowBound;
}

export function planTableSection(
  section: TableSection,
  period: Period,
  timeZone: string,
  page: number
): TableQueryPlan {
  const rowBound =
    section.paging !== undefined
      ? { pageSize: section.paging.pageSize, page }
      : section.limit;
  if (rowBound === undefined) {
    throw new Error('A table requires a row bound');
  }
  return {
    sectionId: section.id,
    source: section.source,
    timeZone,
    dateRange: { firstDate: period.firstDate, lastDate: period.lastDate },
    columns: section.columns.map((column) => ({
      column: column.column,
      type: column.type,
      ...(column.type === 'number' ? { transform: column.transform } : {}),
    })),
    sort:
      section.sort === undefined
        ? null
        : {
            columnIndex: section.columns.findIndex(
              (column) => column.column === section.sort?.column
            ),
            direction: section.sort.direction,
          },
    rows: typeof rowBound === 'number' ? { limit: rowBound } : rowBound,
  };
}
