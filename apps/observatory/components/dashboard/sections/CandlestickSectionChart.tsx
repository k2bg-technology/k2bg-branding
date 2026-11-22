'use client';

import { CandlestickChart, type CandlestickChartProps } from 'ui';

import type { ValueFormat } from '../../../modules/dashboard/domain';
import { formatValue } from '../formatValue';

interface Props
  extends Pick<
    CandlestickChartProps,
    'label' | 'candles' | 'labels' | 'period' | 'upColor' | 'downColor'
  > {
  locale: string;
  timeZone: string;
  currency?: string;
  format: ValueFormat;
  unit?: string;
}

export function CandlestickSectionChart({
  locale,
  currency,
  format,
  unit,
  ...chart
}: Props) {
  return (
    <CandlestickChart
      {...chart}
      locale={locale}
      valueFormatter={(value) =>
        formatValue(value, { format, unit }, { locale, currency })
      }
    />
  );
}
