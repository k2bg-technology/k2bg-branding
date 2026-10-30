'use client';
// `ScrollArea` is client-only, and composing it makes this component the client boundary.

import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';

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
  /** Lets long text wrap within a readable minimum width instead of widening the table. */
  wrap?: boolean;
}

export interface DataTableRow {
  id: string;
  /** Cell content keyed by column id; missing keys render an empty cell. */
  cells: Record<string, ReactNode>;
}

interface Props extends Omit<ComponentPropsWithoutRef<'table'>, 'children'> {
  /** Accessible name of the table, already localized by the consuming app. */
  caption: string;
  columns: DataTableColumn[];
  rows: DataTableRow[];
  /** Totals row keyed by column id; missing keys render an empty cell. */
  footer?: DataTableRow['cells'];
  /** Keep the first column in view while the table scrolls sideways. */
  stickyFirstColumn?: boolean;
  /** Keep the last column, such as a totals column, in view while the table scrolls sideways. */
  stickyLastColumn?: boolean;
  /** Caps the frame's height; taller content scrolls vertically inside it with the header and footer kept in view. */
  maxHeight?: CSSProperties['maxHeight'];
  /** Keep the caption for assistive technology only. */
  visuallyHiddenCaption?: boolean;
  /** Shown in one full-width row when there are no rows, already localized. */
  emptyMessage?: string;
}

const alignClassNames = {
  start: 'text-left',
  end: 'text-right tabular-nums',
} as const;

const wrapClassName = 'min-w-48 whitespace-normal break-words';

/** A totals column is marked by weight and a border, never by colour alone. */
const emphasisClassName = 'border-l border-base-default/20 font-bold';

/*
 * A sticky cell paints over the scrolled cells, so its background has to be opaque, and
 * its trailing padding stands in for the neighbour's leading padding, which scrolls away
 * underneath it — otherwise the frozen label touches the first number still on screen.
 * Its rule is an inset shadow, because a collapsed table border stays behind with the grid.
 */
const stickyCellClassName =
  'sticky left-0 bg-white pr-spacious shadow-[inset_-1px_0_0] shadow-base-default/20';

/** The trailing counterpart of `stickyCellClassName`, mirrored onto the right edge. */
const stickyLastCellClassName =
  'sticky right-0 border-l-0 bg-white pl-spacious shadow-[inset_1px_0_0] shadow-base-default/20';

/** A sticky header cell layers the header row's tint over its opaque background. */
const stickyHeadClassName =
  'bg-linear-to-r from-base-light/40 to-base-light/40';

/*
 * Inside a height-capped frame the header and footer groups stick to the scroll port's
 * edges. They take opaque backgrounds under their tints, and their rules become inset
 * shadows on the cells, because collapsed table borders stay behind with the grid; a
 * sticky corner cell draws both of its rules with one offset shadow. The footer follows
 * the body in document order and paints over it unaided, but the header precedes it, so
 * only the header is lifted — within the frame's isolated stacking context.
 */
const stickyHeaderClassName =
  'sticky top-0 z-1 bg-white [&_tr]:border-b-0 [&_th]:shadow-[inset_0_-1px_0] [&_th]:shadow-base-default/20 [&_[data-sticky=start]]:shadow-[inset_-1px_-1px_0] [&_[data-sticky=end]]:shadow-[inset_1px_-1px_0]';
const stickyFooterClassName =
  'sticky bottom-0 border-t-0 bg-white bg-linear-to-r from-base-light/50 to-base-light/50 [&_td,&_th]:shadow-[inset_0_1px_0] [&_td,&_th]:shadow-base-default/20 [&_[data-sticky=start]]:shadow-[inset_-1px_1px_0] [&_[data-sticky=end]]:shadow-[inset_1px_1px_0]';

/** A row header in the body or the footer keeps the metrics of a data cell. */
const rowHeaderClassName = 'h-auto p-2 font-normal';

/*
 * `ScrollArea`'s viewport is the single scroll port: it anchors the sticky column, takes
 * focus only while it overflows, and its inline size is what `100cqw` measures — hence
 * the container on this frame. `Table` ships its own `overflow-x-auto` container, which
 * is opened up so a second scroll port cannot swallow the horizontal offset. The frame
 * isolates its stacking, so sticky cells never cover popups elsewhere on the page.
 */
const frameClassName =
  "@container isolate rounded-xl border border-base-default/15 bg-white shadow-xs has-[:focus-visible]:border-main-default has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-main-default/30 [&_[data-slot='table-container']]:overflow-visible";

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
  stickyLastColumn = false,
  maxHeight,
  visuallyHiddenCaption = false,
  emptyMessage,
  className,
  ...rest
}: Props) {
  // A right-aligned first column holds numbers, so only a left-aligned one labels its row.
  const firstColumnIsRowLabel = columns[0]?.align !== 'end';
  const isStickyLastCell = (index: number) =>
    stickyLastColumn && index > 0 && index === columns.length - 1;
  const stickySide = (index: number) => {
    if (stickyFirstColumn && index === 0) return 'start';
    if (isStickyLastCell(index)) return 'end';
    return undefined;
  };
  const isHeightCapped = maxHeight !== undefined;

  return (
    // The scroll port itself carries no name, so the region around it does.
    <section aria-label={caption}>
      <ScrollArea
        data-slot="data-table"
        className={frameClassName}
        style={isHeightCapped ? { maxHeight } : undefined}
        scrollbar={
          <>
            <ScrollArea.ScrollBar orientation="horizontal" />
            {isHeightCapped && <ScrollArea.ScrollBar />}
          </>
        }
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
          <Table.Header className={cn(isHeightCapped && stickyHeaderClassName)}>
            <Table.Row className="bg-base-light/40">
              {columns.map((column, index) => {
                const isStickyCell = stickyFirstColumn && index === 0;
                const isStickyLast = isStickyLastCell(index);

                return (
                  <Table.Head
                    key={column.id}
                    scope="col"
                    data-emphasis={column.emphasis ? 'true' : undefined}
                    data-sticky={stickySide(index)}
                    className={cn(
                      alignClassNames[column.align ?? 'start'],
                      column.emphasis && emphasisClassName,
                      isStickyCell &&
                        cn(stickyCellClassName, stickyHeadClassName),
                      isStickyLast &&
                        cn(stickyLastCellClassName, stickyHeadClassName)
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
                  const isStickyLast = isStickyLastCell(index);
                  const cellClassName = cn(
                    alignClassNames[column.align ?? 'start'],
                    column.emphasis && emphasisClassName,
                    column.wrap && wrapClassName,
                    isStickyCell && stickyCellClassName,
                    isStickyLast && stickyLastCellClassName
                  );

                  return isStickyCell && firstColumnIsRowLabel ? (
                    <Table.Head
                      key={column.id}
                      scope="row"
                      data-emphasis={column.emphasis ? 'true' : undefined}
                      data-sticky="start"
                      className={cn(rowHeaderClassName, cellClassName)}
                    >
                      {row.cells[column.id]}
                    </Table.Head>
                  ) : (
                    <Table.Cell
                      key={column.id}
                      data-emphasis={column.emphasis ? 'true' : undefined}
                      data-sticky={stickySide(index)}
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
            <Table.Footer
              className={cn(isHeightCapped && stickyFooterClassName)}
            >
              <Table.Row>
                {columns.map((column, index) => {
                  const isStickyCell = stickyFirstColumn && index === 0;
                  const isStickyLast = isStickyLastCell(index);
                  const cellClassName = cn(
                    alignClassNames[column.align ?? 'start'],
                    column.emphasis && emphasisClassName,
                    column.wrap && wrapClassName,
                    isStickyCell && stickyCellClassName,
                    isStickyLast && stickyLastCellClassName
                  );

                  return index === 0 && firstColumnIsRowLabel ? (
                    <Table.Head
                      key={column.id}
                      scope="row"
                      data-emphasis={column.emphasis ? 'true' : undefined}
                      data-sticky={stickySide(index)}
                      className={cn(rowHeaderClassName, cellClassName)}
                    >
                      {footer[column.id]}
                    </Table.Head>
                  ) : (
                    <Table.Cell
                      key={column.id}
                      data-emphasis={column.emphasis ? 'true' : undefined}
                      data-sticky={stickySide(index)}
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

export type { Props as DataTableProps };
