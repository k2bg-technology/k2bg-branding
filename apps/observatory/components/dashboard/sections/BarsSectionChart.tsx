'use client';

import { BarChart, type BarSeries } from 'ui';

import type { ValueFormat } from '../../../modules/dashboard/domain';
import { formatValue } from '../formatValue';

interface Props {
  label: string;
  categories: string[];
  series: BarSeries[];
  stacked: boolean;
  locale: string;
  currency?: string;
  format: ValueFormat;
  unit?: string;
}

// The client creates the formatter callback because functions cannot cross the server boundary.
export function BarsSectionChart({
  label,
  categories,
  series,
  stacked,
  locale,
  currency,
  format,
  unit,
}: Props) {
  return (
    <BarChart
      label={label}
      categories={categories}
      series={series}
      stacked={stacked}
      valueFormatter={(value) =>
        formatValue(value, { format, unit }, { locale, currency })
      }
    />
  );
}
