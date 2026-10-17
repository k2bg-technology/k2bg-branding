'use client';

import {
  type AxisDomainItem,
  Bar,
  CartesianGrid,
  BarChart as RechartsBarChart,
  ReferenceLine,
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
import {
  defaultValueFormatter,
  valueAxisTick,
  valueAxisWidth,
} from './chartTicks';
import type { BarSeries, ChartHeight, ChartTooltipData } from './types';

type BarRow = Record<string, string | number | null>;

interface ValueExtent {
  minimum: number;
  maximum: number;
}

/** Stands in for a value the tooltip cannot format because it was never measured. */
const missingValueLabel = '—';

function seriesValue(seriesItem: BarSeries, categoryIndex: number) {
  return seriesItem.values[categoryIndex] ?? null;
}

function sumValues(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function buildRows(categories: string[], series: BarSeries[]) {
  return categories.map((category, categoryIndex) => {
    const row: BarRow = { category };
    for (const seriesItem of series) {
      row[seriesDataKey(seriesItem.id)] = seriesValue(
        seriesItem,
        categoryIndex
      );
    }
    return row;
  });
}

/** What the value axis has to span; stacked bars reach their per-category totals. */
function valueExtent(
  categories: string[],
  series: BarSeries[],
  stacked: boolean
) {
  return categories.reduce<ValueExtent>(
    (extent, _category, categoryIndex) => {
      const values = series.flatMap((seriesItem) => {
        const value = seriesValue(seriesItem, categoryIndex);
        return value === null ? [] : [value];
      });
      const negatives = values.filter((value) => value < 0);
      const positives = values.filter((value) => value > 0);
      return {
        minimum: Math.min(
          extent.minimum,
          stacked ? sumValues(negatives) : Math.min(0, ...negatives)
        ),
        maximum: Math.max(
          extent.maximum,
          stacked ? sumValues(positives) : Math.max(0, ...positives)
        ),
      };
    },
    { minimum: 0, maximum: 0 }
  );
}

export interface BarChartProps {
  /** Accessible name of the chart, already localized by the consuming app. */
  label: string;
  categories: string[];
  series: BarSeries[];
  stacked?: boolean;
  height?: ChartHeight;
  valueFormatter?: (value: number) => string;
  /** Formats the value-axis ticks; defaults to `valueFormatter`. */
  axisValueFormatter?: (value: number) => string;
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
  axisValueFormatter,
  showLegend,
  animated = false,
  className,
}: BarChartProps) {
  const rows = buildRows(categories, series);
  const extent = valueExtent(categories, series, stacked);
  const formatAxisValue = axisValueFormatter ?? valueFormatter;
  const hasNegativeValue = extent.minimum < 0;
  const hasPositiveValue = extent.maximum > 0;
  // A keyword bound lets the library fit and round that side of the axis; the
  // literal 0 pins the baseline so bars always have a zero to grow from.
  const valueDomain: [AxisDomainItem, AxisDomainItem] = [
    hasNegativeValue ? 'auto' : 0,
    hasNegativeValue && !hasPositiveValue ? 0 : 'auto',
  ];

  const colorBySeriesId = new Map(
    series.map((seriesItem, index) => [
      seriesItem.id,
      resolveSeriesColor(seriesItem, index),
    ])
  );
  const seriesColor = (seriesId: string) => colorBySeriesId.get(seriesId);

  // Recharts leaves a series out of the payload where it has no value, so the
  // items come from the series themselves and the payload only supplies values.
  const toTooltipData = ({
    label: hoveredCategory,
    payload,
  }: TooltipContentProps): ChartTooltipData => {
    const valueByDataKey = new Map(
      (payload ?? []).map((entry) => [String(entry.dataKey), entry.value])
    );
    return {
      heading: String(hoveredCategory ?? ''),
      items: series.map((seriesItem) => {
        const value = valueByDataKey.get(seriesDataKey(seriesItem.id));
        return {
          id: seriesItem.id,
          label: seriesItem.label,
          color: seriesColor(seriesItem.id) ?? '',
          // A category without a measurement is not a zero, so it never reaches
          // the formatter.
          value:
            typeof value === 'number'
              ? valueFormatter(value)
              : missingValueLabel,
        };
      }),
    };
  };

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
          // Negative segments stack below the baseline instead of cancelling
          // out the positive side of the stack.
          stackOffset="sign"
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
            width={valueAxisWidth(
              [extent.minimum, extent.maximum],
              formatAxisValue
            )}
            domain={valueDomain}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={formatAxisValue}
            tick={valueAxisTick}
          />
          {/* A category the reader can land on always answers, so the missing
              measurements stay in the payload instead of emptying it. */}
          <Tooltip
            content={renderTooltipContent}
            filterNull={false}
            isAnimationActive={false}
          />
          {/* Without negative bars the category axis already reads as the
              baseline; with them the bars need a zero line to hang from. */}
          {hasNegativeValue && <ReferenceLine y={0} />}
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
