import { Fragment } from 'react';

import { cn } from '../../utils/cn';
import {
  type HeatmapScaleLabels,
  heatmapCellColor,
  heatmapLevel,
} from './chartHeatmapScale';
import { defaultValueFormatter } from './chartTicks';
import { HeatmapScaleLegend } from './HeatmapScaleLegend';
import { ChartColor } from './types';

export interface MatrixHeatmapProps {
  label: string;
  rows: string[];
  columns: string[];
  /** `values[rowIndex][columnIndex]`; null renders an outlined empty cell. */
  values: (number | null)[][];
  color?: ChartColor;
  /** Bottom of the color scale; values at or below it render as the empty step. */
  min?: number;
  /** Top of the color scale; defaults to the largest value in `values`. */
  max?: number;
  valueFormatter?: (value: number) => string;
  scaleLabels?: HeatmapScaleLabels;
  className?: string;
}

function measuredValues(values: (number | null)[][]): number[] {
  return values
    .flat()
    .filter((value): value is number => value !== null && value !== undefined);
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
  scaleLabels,
  className,
}: MatrixHeatmapProps) {
  const measured = measuredValues(values);
  const scaleMax = max ?? (measured.length > 0 ? Math.max(...measured) : 0);

  return (
    <div
      role="img"
      aria-label={label}
      data-slot="matrix-heatmap"
      className={cn('flex flex-col gap-2', className)}
    >
      <div
        className="grid gap-0.5 text-caption text-base-black/80"
        style={{
          gridTemplateColumns: `auto repeat(${columns.length}, minmax(0, 1fr))`,
        }}
      >
        <span />
        {columns.map((column) => (
          <span key={column} className="text-center leading-normal">
            {column}
          </span>
        ))}
        {rows.map((row, rowIndex) => (
          <Fragment key={row}>
            <span className="pr-1 text-right leading-normal">{row}</span>
            {columns.map((column, columnIndex) => {
              const value = values[rowIndex]?.[columnIndex] ?? null;
              if (value === null) {
                return (
                  <span
                    key={column}
                    data-slot="matrix-heatmap-cell"
                    className="aspect-square rounded-xs border border-base-light"
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
      {scaleLabels && <HeatmapScaleLegend color={color} labels={scaleLabels} />}
    </div>
  );
}
