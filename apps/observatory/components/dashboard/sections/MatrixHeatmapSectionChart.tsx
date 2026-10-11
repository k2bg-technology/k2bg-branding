'use client';

import { type HeatmapScaleLabels, MatrixHeatmap } from 'ui';

import type { ValueFormat } from '../../../modules/dashboard/domain';
import { formatValue } from '../formatValue';

interface Props {
  label: string;
  rows: string[];
  columns: string[];
  values: (number | null)[][];
  minimum?: number;
  maximum?: number;
  locale: string;
  currency?: string;
  format: ValueFormat;
  unit?: string;
  emptyLabel: string;
  scaleLabels?: HeatmapScaleLabels;
}

// The client creates the formatter callback because functions cannot cross the server boundary.
export function MatrixHeatmapSectionChart({
  label,
  rows,
  columns,
  values,
  minimum,
  maximum,
  locale,
  currency,
  format,
  unit,
  emptyLabel,
  scaleLabels,
}: Props) {
  return (
    <MatrixHeatmap
      label={label}
      rows={rows}
      columns={columns}
      values={values}
      min={minimum}
      max={maximum}
      valueFormatter={(value) =>
        formatValue(value, { format, unit }, { locale, currency })
      }
      emptyLabel={emptyLabel}
      scaleLabels={scaleLabels}
    />
  );
}
