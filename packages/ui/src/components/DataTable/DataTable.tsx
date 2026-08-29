import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { Table } from '../Table';

export interface DataTableColumn {
  id: string;
  /** Column heading, already localized by the consuming app. */
  header: ReactNode;
  /** `end` right-aligns the column for numbers. */
  align?: 'start' | 'end';
}

export interface DataTableRow {
  id: string;
  /** Cell content keyed by column id; missing keys render an empty cell. */
  cells: Record<string, ReactNode>;
}

export interface DataTableProps
  extends Omit<ComponentPropsWithoutRef<'table'>, 'children'> {
  /** Accessible name of the table, already localized by the consuming app. */
  caption: string;
  columns: DataTableColumn[];
  rows: DataTableRow[];
  /** Keep the caption for assistive technology only. */
  visuallyHiddenCaption?: boolean;
  /** Shown in one full-width row when there are no rows, already localized. */
  emptyMessage?: string;
}

const alignClassNames = {
  start: 'text-left',
  end: 'text-right tabular-nums',
} as const;

export function DataTable({
  caption,
  columns,
  rows,
  visuallyHiddenCaption = false,
  emptyMessage,
  className,
  ...rest
}: DataTableProps) {
  return (
    <div
      data-slot="data-table"
      className="overflow-hidden rounded-lg border border-base-default/20"
    >
      <Table className={className} {...rest}>
        <Table.Caption
          className={cn(
            'px-2 pb-spacious text-left',
            visuallyHiddenCaption && 'sr-only'
          )}
        >
          {caption}
        </Table.Caption>
        <Table.Header>
          <Table.Row>
            {columns.map((column) => (
              <Table.Head
                key={column.id}
                scope="col"
                className={alignClassNames[column.align ?? 'start']}
              >
                {column.header}
              </Table.Head>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row key={row.id}>
              {columns.map((column) => (
                <Table.Cell
                  key={column.id}
                  className={alignClassNames[column.align ?? 'start']}
                >
                  {row.cells[column.id]}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
          {rows.length === 0 && emptyMessage !== undefined && (
            <Table.Row>
              <Table.Cell colSpan={columns.length} className="h-24 text-center">
                {emptyMessage}
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </div>
  );
}
