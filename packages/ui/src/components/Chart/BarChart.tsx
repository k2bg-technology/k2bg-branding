'use client';

import {
  Bar,
  CartesianGrid,
  BarChart as RechartsBarChart,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartContainer } from './ChartContainer';
import { ChartLegend } from './ChartLegend';
import { ChartTooltip } from './ChartTooltip';
import { seriesDataKey } from './chartSeries';
import { chartAccessibleName, resolveSeriesColor } from './chartTheme';
import { defaultValueFormatter } from './chartTicks';
import type { BarSeries, ChartHeight, ChartTooltipData } from './types';

type BarRow = Record<string, string | number | null>;

function buildRows(categories: string[], series: BarSeries[]): BarRow[] {
  return categories.map((category, categoryIndex) => {
    const row: BarRow = { category };
    for (const seriesItem of series) {
      row[seriesDataKey(seriesItem.id)] =
        seriesItem.values[categoryIndex] ?? null;
    }
    return row;
  });
}

export interface BarChartProps {
  /** Accessible name of the chart, already localized by the consuming app. */
  label: string;
  categories: string[];
  series: BarSeries[];
  stacked?: boolean;
  height?: ChartHeight;
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  animated?: boolean;
  className?: string;
}

export function BarChart({
  label,
  categories,
  series,
  stacked = false,
  height,
  valueFormatter = defaultValueFormatter,
  showLegend,
  animated = false,
  className,
}: BarChartProps) {
  const rows = buildRows(categories, series);
  const seriesInfoByDataKey = new Map(
    series.map((seriesItem, index) => [
      seriesDataKey(seriesItem.id),
      {
        id: seriesItem.id,
        label: seriesItem.label,
        color: resolveSeriesColor(seriesItem, index),
      },
    ])
  );
  const seriesColor = (seriesId: string) =>
    seriesInfoByDataKey.get(seriesDataKey(seriesId))?.color;

  const toTooltipData = ({
    label: hoveredCategory,
    payload,
  }: TooltipContentProps): ChartTooltipData => ({
    heading: String(hoveredCategory ?? ''),
    items: (payload ?? []).flatMap((entry) => {
      const seriesInfo = seriesInfoByDataKey.get(String(entry.dataKey));
      if (seriesInfo === undefined || typeof entry.value !== 'number') {
        return [];
      }
      return {
        id: seriesInfo.id,
        label: seriesInfo.label,
        color: seriesInfo.color,
        value: valueFormatter(entry.value),
      };
    }),
  });

  const renderTooltipContent = (tooltipProps: TooltipContentProps) => {
    if (!tooltipProps.active || tooltipProps.payload?.length === 0) {
      return null;
    }
    return <ChartTooltip data={toTooltipData(tooltipProps)} />;
  };

  // Only the top of a stack has a free edge to round.
  const barRadius = (index: number): [number, number, number, number] =>
    !stacked || index === series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0];

  const isLegendVisible = showLegend ?? series.length > 1;
  const legendItems = series.map((seriesItem) => ({
    id: seriesItem.id,
    label: seriesItem.label,
    color: seriesColor(seriesItem.id) ?? '',
  }));

  return (
    <div data-slot="bar-chart" className={className}>
      <ChartContainer height={height}>
        <RechartsBarChart
          data={rows}
          margin={{ left: 12, right: 12 }}
          {...chartAccessibleName(label)}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="category"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            width={48}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={valueFormatter}
          />
          <Tooltip content={renderTooltipContent} isAnimationActive={false} />
          {series.map((seriesItem, index) => (
            <Bar
              key={seriesItem.id}
              dataKey={seriesDataKey(seriesItem.id)}
              fill={seriesColor(seriesItem.id)}
              stackId={stacked ? 'stack' : undefined}
              radius={barRadius(index)}
              isAnimationActive={animated}
            />
          ))}
        </RechartsBarChart>
      </ChartContainer>
      {isLegendVisible && <ChartLegend items={legendItems} />}
    </div>
  );
}
