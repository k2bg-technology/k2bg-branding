'use client';

import {
  ScatterChart,
  type ScatterChartSeries,
  type ScatterChartTrendLine,
} from 'ui';

import type { ScatterAxis } from '../../../modules/dashboard/domain';
import { formatValue } from '../formatValue';

interface Props {
  label: string;
  series: ScatterChartSeries[];
  trendLine: ScatterChartTrendLine | null;
  x: ScatterAxis;
  y: ScatterAxis;
  locale: string;
  currency?: string;
}

// The client creates the formatter callbacks because functions cannot cross the server boundary.
export function ScatterSectionChart({
  label,
  series,
  trendLine,
  x,
  y,
  locale,
  currency,
}: Props) {
  return (
    <ScatterChart
      label={label}
      xLabel={x.label}
      yLabel={y.label}
      series={series}
      trendLine={trendLine ?? undefined}
      xValueFormatter={(value) => formatValue(value, x, { locale, currency })}
      yValueFormatter={(value) => formatValue(value, y, { locale, currency })}
    />
  );
}
