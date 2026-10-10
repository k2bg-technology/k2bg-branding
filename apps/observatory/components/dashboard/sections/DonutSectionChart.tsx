'use client';

import { DonutChart, type DonutChartSlice } from 'ui';

import type { ValueFormat } from '../../../modules/dashboard/domain';
import { formatValue } from '../formatValue';

interface Props {
  label: string;
  slices: DonutChartSlice[];
  centerValue: string;
  centerLabel?: string;
  locale: string;
  currency?: string;
  format: ValueFormat;
  unit?: string;
}

// The client creates the formatter callback because functions cannot cross the server boundary.
export function DonutSectionChart({
  label,
  slices,
  centerValue,
  centerLabel,
  locale,
  currency,
  format,
  unit,
}: Props) {
  return (
    <DonutChart
      label={label}
      slices={slices}
      centerValue={centerValue}
      centerLabel={centerLabel}
      valueFormatter={(value) =>
        formatValue(value, { format, unit }, { locale, currency })
      }
    />
  );
}
