'use client';

import {
  CalendarHeatmap,
  type CalendarHeatmapDay,
  type HeatmapScaleLabels,
} from 'ui';

import type { ValueFormat } from '../../../modules/dashboard/domain';
import { formatValue } from '../formatValue';

interface Props {
  label: string;
  days: CalendarHeatmapDay[];
  maximum?: number;
  locale: string;
  currency?: string;
  format: ValueFormat;
  unit?: string;
  emptyLabel: string;
  scaleLabels?: HeatmapScaleLabels;
}

// The client creates the formatter callback because functions cannot cross the server boundary.
export function CalendarHeatmapSectionChart({
  label,
  days,
  maximum,
  locale,
  currency,
  format,
  unit,
  emptyLabel,
  scaleLabels,
}: Props) {
  return (
    <CalendarHeatmap
      label={label}
      days={days}
      max={maximum}
      valueFormatter={(value) =>
        formatValue(value, { format, unit }, { locale, currency })
      }
      locale={locale}
      emptyLabel={emptyLabel}
      scaleLabels={scaleLabels}
    />
  );
}
