'use client';

import { Fragment, useId } from 'react';

import { cn } from '../../utils/cn';
import { ScrollArea } from '../ScrollArea';
import {
  type HeatmapScaleLabels,
  heatmapCellColor,
  heatmapEmptyCellBackgroundImage,
  heatmapLevel,
} from './chartHeatmapScale';
import { defaultValueFormatter } from './chartTicks';
import { HeatmapScaleLegend } from './HeatmapScaleLegend';
import { ChartColor } from './types';

const defaultMinimumCellSize = 12;
const defaultMaximumCellSize = 64;
/** One height for the column-header row on both sides, so the rows below it line up. */
const headerRowHeight = 20;

export interface MatrixHeatmapProps {
  label: string;
  rows: string[];
  columns: string[];
  /** `values[rowIndex][columnIndex]`; null renders an outlined empty cell. */
  values: (number | null)[][];
  color?: ChartColor;
  /** Bottom of the color scale; values at or below it render at the lowest step. */
  min?: number;
  /** Top of the color scale; defaults to the largest value in `values`. */
  max?: number;
  valueFormatter?: (value: number) => string;
  /** Shown for cells without a measurement, already localized by the app. */
  emptyLabel?: string;
  /** Smallest cell edge in px; the grid scrolls rather than going below it. */
  minimumCellSize?: number;
  /** Largest cell edge in px; the grid stops growing there in a wide container. */
  maximumCellSize?: number;
  scaleLabels?: HeatmapScaleLabels;
  className?: string;
}

function measuredValues(values: (number | null)[][]) {
  return values
    .flat()
    .filter((value): value is number => value !== null && value !== undefined);
}

/** A row that stops short of the columns leaves the rest of it unmeasured too. */
function missingCellCount(
  rows: string[],
  columns: string[],
  values: (number | null)[][]
) {
  return rows
    .flatMap((_, rowIndex) =>
      columns.map((__, columnIndex) => values[rowIndex]?.[columnIndex] ?? null)
    )
    .filter((value) => value === null).length;
}

export function MatrixHeatmap({
  label,
  rows,
  columns,
  values,
  color = ChartColor.CHART_1,
  min = 0,
  max,
  valueFormatter = defaultValueFormatter,
  emptyLabel = 'No data',
  minimumCellSize = defaultMinimumCellSize,
  maximumCellSize = defaultMaximumCellSize,
  scaleLabels,
  className,
}: MatrixHeatmapProps) {
  const descriptionId = useId();
  const measured = measuredValues(values);
  const scaleMax = max ?? (measured.length > 0 ? Math.max(...measured) : 0);
  const missingCells = missingCellCount(rows, columns, values);

  return (
    <div
      data-slot="matrix-heatmap"
      className={cn('flex flex-col gap-2', className)}
    >
      <div className="flex gap-0.5">
        {/* The labels sit beside the scroll port, so scrolled cells are clipped
            by it rather than passing under them; nothing has to mask them.
            `1fr` rows stretch to the grid's height and land on its rows. */}
        <div
          aria-hidden
          className="grid gap-0.5 text-caption text-base-black/80"
          style={{
            gridTemplateRows: `${headerRowHeight}px repeat(${rows.length}, minmax(0, 1fr))`,
          }}
        >
          <span />
          {rows.map((row) => (
            <span
              key={row}
              data-slot="matrix-heatmap-row-label"
              className="flex items-center justify-end pr-1 leading-normal"
            >
              {row}
            </span>
          ))}
        </div>
        {/* The image role sits inside the scroll port, not around it: the port is
            the element a keyboard focuses (WCAG 2.1.1), and an `img` subtree is
            presentational, so a focusable descendant of it would be unreachable. */}
        <ScrollArea
          className="min-w-0"
          data-slot="matrix-heatmap-scroll"
          scrollbar={<ScrollArea.ScrollBar orientation="horizontal" />}
        >
          {/* `justify-start` keeps spare width on the trailing side. */}
          <div
            role="img"
            aria-label={label}
            aria-describedby={missingCells > 0 ? descriptionId : undefined}
            data-slot="matrix-heatmap-grid"
            className="grid justify-start gap-0.5 text-caption text-base-black/80"
            style={{
              gridTemplateColumns: `repeat(${columns.length}, minmax(${minimumCellSize}px, ${maximumCellSize}px))`,
              gridTemplateRows: `${headerRowHeight}px repeat(${rows.length}, auto)`,
            }}
          >
            {columns.map((column) => (
              <span key={column} className="text-center leading-normal">
                {column}
              </span>
            ))}
            {rows.map((row, rowIndex) => (
              <Fragment key={row}>
                {columns.map((column, columnIndex) => {
                  const value = values[rowIndex]?.[columnIndex] ?? null;
                  if (value === null) {
                    return (
                      <span
                        key={column}
                        data-slot="matrix-heatmap-cell"
                        data-empty
                        title={`${row} ${column}: ${emptyLabel}`}
                        className="aspect-square rounded-xs border border-base-light"
                        style={{
                          backgroundImage: heatmapEmptyCellBackgroundImage,
                        }}
                      />
                    );
                  }
                  return (
                    <span
                      key={column}
                      data-slot="matrix-heatmap-cell"
                      title={`${row} ${column}: ${valueFormatter(value)}`}
                      className="aspect-square rounded-xs"
                      style={{
                        backgroundColor: heatmapCellColor(
                          heatmapLevel(value, min, scaleMax),
                          color
                        ),
                      }}
                    />
                  );
                })}
              </Fragment>
            ))}
          </div>
        </ScrollArea>
      </div>
      {/* The grid is an `img`, so its subtree is presentational and a cell's
          `title` never reaches assistive technology. This says how much is
          missing, in the caller's own words, outside that subtree. */}
      {missingCells > 0 && (
        <span id={descriptionId} className="sr-only">
          {`${emptyLabel}: ${missingCells}`}
        </span>
      )}
      {scaleLabels && (
        <HeatmapScaleLegend
          color={color}
          labels={scaleLabels}
          emptyLabel={missingCells > 0 ? emptyLabel : undefined}
        />
      )}
    </div>
  );
}
