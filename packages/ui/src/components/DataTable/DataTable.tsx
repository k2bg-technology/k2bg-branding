'use client';
// `ScrollArea` is client-only, and composing it makes this component the client boundary.

import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { ScrollArea } from '../ScrollArea';
import { Table } from '../Table';

export interface DataTableColumn {
  id: string;
  /** Column heading, already localized by the consuming app. */
  header: ReactNode;
  /** `end` right-aligns the column for numbers. */
  align?: 'start' | 'end';
  /** Marks a totals column: heavier text and a border separating it from the data. */
  emphasis?: boolean;
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
  /** Totals row keyed by column id; missing keys render an empty cell. */
  footer?: DataTableRow['cells'];
  /** Keep the first column in view while the table scrolls sideways. */
  stickyFirstColumn?: boolean;
  /** Keep the caption for assistive technology only. */
  visuallyHiddenCaption?: boolean;
  /** Shown in one full-width row when there are no rows, already localized. */
  emptyMessage?: string;
}

const alignClassNames = {
  start: 'text-left',
  end: 'text-right tabular-nums',
} as const;

/** A totals column is marked by weight and a border, never by colour alone. */
const emphasisClassName = 'border-l border-base-default/20 font-bold';

/*
 * A sticky cell paints over the scrolled cells, so its background has to be opaque, and
 * its trailing padding stands in for the neighbour's leading padding, which scrolls away
 * underneath it — otherwise the frozen label touches the first number still on screen.
 */
const stickyCellClassName =
  'sticky left-0 z-10 border-r border-base-default/20 bg-base-white pr-spacious';

/** The footer tint is translucent, so the sticky footer cell repeats it opaquely. */
const stickyFooterCellClassName =
  'sticky left-0 z-10 border-r border-base-default/20 bg-base-light pr-spacious';

/** A row header in the body or the footer keeps the metrics of a data cell. */
const rowHeaderClassName = 'h-auto p-2 font-normal';

/*
 * `ScrollArea`'s viewport is the single scroll port: it anchors the sticky column, takes
 * focus only while it overflows, and its inline size is what `100cqw` measures — hence
 * the container on this frame. `Table` ships its own `overflow-x-auto` container, which
 * is opened up so a second scroll port cannot swallow the horizontal offset.
 */
const frameClassName =
  "@container rounded-lg border border-base-default/20 has-[:focus-visible]:border-main-default has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-main-default/30 [&_[data-slot='table-container']]:overflow-visible";

/*
 * The caption box is as wide as the table, so a visible caption would scroll away with it.
 * Its text is pinned to the scroll port's left edge and bounded to the visible width, so
 * it stays readable and a long caption wraps instead of stretching the table.
 */
const captionTextClassName = 'sticky left-0 block w-[100cqw] px-2';

export function DataTable({
  caption,
  columns,
  rows,
  footer,
  stickyFirstColumn = false,
  visuallyHiddenCaption = false,
  emptyMessage,
  className,
  ...rest
}: DataTableProps) {
  // A right-aligned first column holds numbers, so only a left-aligned one labels its row.
  const firstColumnIsRowLabel = columns[0]?.align !== 'end';

  return (
    // The scroll port itself carries no name, so the region around it does.
    <section aria-label={caption}>
      <ScrollArea
        data-slot="data-table"
        className={frameClassName}
        scrollbar={<ScrollArea.ScrollBar orientation="horizontal" />}
      >
        <Table className={className} {...rest}>
          <Table.Caption
            className={cn(
              'pb-spacious text-left',
              visuallyHiddenCaption && 'sr-only'
            )}
          >
            {visuallyHiddenCaption ? (
              caption
            ) : (
              <span className={captionTextClassName}>{caption}</span>
            )}
          </Table.Caption>
          <Table.Header>
            <Table.Row>
              {columns.map((column, index) => {
                const isStickyCell = stickyFirstColumn && index === 0;

                return (
                  <Table.Head
                    key={column.id}
                    scope="col"
                    data-emphasis={column.emphasis ? 'true' : undefined}
                    data-sticky={isStickyCell ? 'true' : undefined}
                    className={cn(
                      alignClassNames[column.align ?? 'start'],
                      column.emphasis && emphasisClassName,
                      isStickyCell && stickyCellClassName
                    )}
                  >
                    {column.header}
                  </Table.Head>
                );
              })}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.id}>
                {columns.map((column, index) => {
                  const isStickyCell = stickyFirstColumn && index === 0;
                  const cellClassName = cn(
                    alignClassNames[column.align ?? 'start'],
                    column.emphasis && emphasisClassName,
                    isStickyCell && stickyCellClassName
                  );

                  return isStickyCell && firstColumnIsRowLabel ? (
                    <Table.Head
                      key={column.id}
                      scope="row"
                      data-emphasis={column.emphasis ? 'true' : undefined}
                      data-sticky="true"
                      className={cn(rowHeaderClassName, cellClassName)}
                    >
                      {row.cells[column.id]}
                    </Table.Head>
                  ) : (
                    <Table.Cell
                      key={column.id}
                      data-emphasis={column.emphasis ? 'true' : undefined}
                      data-sticky={isStickyCell ? 'true' : undefined}
                      className={cellClassName}
                    >
                      {row.cells[column.id]}
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            ))}
            {rows.length === 0 && emptyMessage !== undefined && (
              <Table.Row>
                <Table.Cell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
          {footer !== undefined && (
            <Table.Footer>
              <Table.Row>
                {columns.map((column, index) => {
                  const isStickyCell = stickyFirstColumn && index === 0;
                  const cellClassName = cn(
                    alignClassNames[column.align ?? 'start'],
                    column.emphasis && emphasisClassName,
                    isStickyCell && stickyFooterCellClassName
                  );

                  return index === 0 && firstColumnIsRowLabel ? (
                    <Table.Head
                      key={column.id}
                      scope="row"
                      data-emphasis={column.emphasis ? 'true' : undefined}
                      data-sticky={isStickyCell ? 'true' : undefined}
                      className={cn(rowHeaderClassName, cellClassName)}
                    >
                      {footer[column.id]}
                    </Table.Head>
                  ) : (
                    <Table.Cell
                      key={column.id}
                      data-emphasis={column.emphasis ? 'true' : undefined}
                      data-sticky={isStickyCell ? 'true' : undefined}
                      className={cellClassName}
                    >
                      {footer[column.id]}
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            </Table.Footer>
          )}
        </Table>
      </ScrollArea>
    </section>
  );
}
