import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cn } from '../../utils/cn';

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
  className,
  ...rest
}: DataTableProps) {
  return (
    <div data-slot="data-table-container" className="overflow-x-auto">
      <table
        data-slot="data-table"
        className={cn(
          'min-w-full caption-bottom text-body-r-sm text-base-black',
          className
        )}
        {...rest}
      >
        <caption
          className={cn(
            'pt-normal text-left text-caption text-base-black/80',
            visuallyHiddenCaption && 'sr-only'
          )}
        >
          {caption}
        </caption>
        <thead className="border-b-2 border-base-default/20">
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={cn(
                  'px-3 py-2 font-bold whitespace-nowrap',
                  alignClassNames[column.align ?? 'start']
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-base-default/20">
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={cn(
                    'px-3 py-2 whitespace-nowrap',
                    alignClassNames[column.align ?? 'start']
                  )}
                >
                  {row.cells[column.id]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
