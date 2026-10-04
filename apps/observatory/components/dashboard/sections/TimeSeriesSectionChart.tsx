'use client';

import {
  type ChartPeriod,
  TimeSeriesChart,
  type TimeSeriesChartSeries,
} from 'ui';

import type { ValueFormat } from '../../../modules/dashboard/domain';
import { formatValue } from '../formatValue';

interface Props {
  label: string;
  chartPeriod: ChartPeriod;
  series: TimeSeriesChartSeries[];
  variant: 'line' | 'area';
  stacked: boolean;
  locale: string;
  timeZone: string;
  currency?: string;
  format: ValueFormat;
  unit?: string;
}

// The client creates the formatter callback because functions cannot cross the server boundary.
export function TimeSeriesSectionChart({
  label,
  chartPeriod,
  series,
  variant,
  stacked,
  locale,
  timeZone,
  currency,
  format,
  unit,
}: Props) {
  return (
    <TimeSeriesChart
      label={label}
      series={series}
      period={chartPeriod}
      variant={variant}
      stacked={stacked}
      timeZone={timeZone}
      locale={locale}
      valueFormatter={(value) =>
        formatValue(value, { format, unit }, { locale, currency })
      }
    />
  );
}
