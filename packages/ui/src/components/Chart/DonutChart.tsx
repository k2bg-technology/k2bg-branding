'use client';

import {
  Cell,
  Pie,
  PieChart,
  Tooltip,
  type TooltipContentProps,
} from 'recharts';

import { ChartContainer } from './ChartContainer';
import { ChartLegend } from './ChartLegend';
import { ChartTooltip } from './ChartTooltip';
import { chartAccessibleName, resolveSeriesColor } from './chartTheme';
import { defaultValueFormatter } from './chartTicks';
import type { ChartColor, ChartHeight, ChartTooltipData } from './types';

export interface DonutChartSlice {
  id: string;
  label: string;
  value: number;
  color?: ChartColor;
}

function hoveredSliceId(payload: TooltipContentProps['payload']): string {
  const slice: unknown = payload?.[0]?.payload;
  if (
    typeof slice === 'object' &&
    slice !== null &&
    'id' in slice &&
    typeof slice.id === 'string'
  ) {
    return slice.id;
  }
  return '';
}

export interface DonutChartProps {
  label: string;
  slices: DonutChartSlice[];
  centerValue?: string;
  centerLabel?: string;
  height?: ChartHeight;
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  animated?: boolean;
  className?: string;
}

export function DonutChart({
  label,
  slices,
  centerValue,
  centerLabel,
  height,
  valueFormatter = defaultValueFormatter,
  showLegend,
  animated = false,
  className,
}: DonutChartProps) {
  const sliceColorById = new Map(
    slices.map((slice, index) => [slice.id, resolveSeriesColor(slice, index)])
  );
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const shareLabel = (value: number) =>
    `${total === 0 ? 0 : Math.round((value / total) * 100)}%`;

  const toTooltipData = (
    tooltipProps: TooltipContentProps
  ): ChartTooltipData => {
    const hoveredId = hoveredSliceId(tooltipProps.payload);
    const slice = slices.find((candidate) => candidate.id === hoveredId);
    if (slice === undefined) {
      return { heading: '', items: [] };
    }
    return {
      heading: slice.label,
      items: [
        {
          id: slice.id,
          label: shareLabel(slice.value),
          color: sliceColorById.get(slice.id) ?? '',
          value: valueFormatter(slice.value),
        },
      ],
    };
  };

  const hasCenterText = centerValue !== undefined || centerLabel !== undefined;
  const isLegendVisible = showLegend ?? slices.length > 1;
  const legendItems = slices.map((slice) => ({
    id: slice.id,
    label: slice.label,
    color: sliceColorById.get(slice.id) ?? '',
  }));

  return (
    <div data-slot="donut-chart" className={className}>
      {/* The hole content is real DOM text rather than an SVG label, so it
          stays selectable and readable; pointer events pass through to the
          sectors underneath. */}
      <div className="relative">
        <ChartContainer height={height}>
          <PieChart {...chartAccessibleName(label)}>
            <Tooltip
              content={(tooltipProps: TooltipContentProps) => {
                if (
                  !tooltipProps.active ||
                  tooltipProps.payload?.length === 0
                ) {
                  return null;
                }
                return <ChartTooltip data={toTooltipData(tooltipProps)} />;
              }}
              cursor={false}
              isAnimationActive={false}
            />
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              innerRadius="65%"
              outerRadius="90%"
              isAnimationActive={animated}
            >
              {slices.map((slice, index) => (
                <Cell key={slice.id} fill={resolveSeriesColor(slice, index)} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        {hasCenterText && (
          <div
            data-slot="donut-chart-center"
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
          >
            {centerValue !== undefined && (
              <span className="text-heading-2 font-medium text-base-black tabular-nums">
                {centerValue}
              </span>
            )}
            {centerLabel !== undefined && (
              <span className="text-caption text-base-black/80">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>
      {isLegendVisible && <ChartLegend items={legendItems} />}
    </div>
  );
}
