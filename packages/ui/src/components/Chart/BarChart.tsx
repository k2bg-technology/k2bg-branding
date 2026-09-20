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
import { defaultValueFormatter } from './chartTicks';
import type { BarSeries, ChartHeight, ChartTooltipData } from './types';

type BarRow = Record<string, string | number | null>;

interface ValueExtent {
  minimum: number;
  maximum: number;
}

/** Stands in for a value the tooltip cannot format because it was never measured. */
const missingValueLabel = '—';
/** The value axis never becomes narrower than this, so short labels keep their layout. */
const minimumValueAxisWidth = 48;
/** Tick labels render at the caption size of the brand's monospace stack. */
const tickFontSize = 'var(--text-caption)';
/** Menlo and its monospace fallbacks advance 0.6em: 7.23px at the 12px caption, plus a margin. */
const tickCharacterWidth = 7.5;
/** Recharts' own gap between a tick label and the plot area (tickSize + tickMargin). */
const tickLabelGap = 14;

function seriesValue(
  seriesItem: BarSeries,
  categoryIndex: number
): number | null {
  return seriesItem.values[categoryIndex] ?? null;
}

function sumValues(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function buildRows(categories: string[], series: BarSeries[]): BarRow[] {
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
): ValueExtent {
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

/**
 * Recharts' automatic axis width has no lower bound, so the width is derived from
 * the widest label the axis can show. Nice ticks stay close to the measured
 * extent, so its formatted bounds stand in for the widest tick label.
 */
function valueAxisWidth(
  extent: ValueExtent,
  formatValue: (value: number) => string
): number {
  const longestLabelLength = Math.max(
    formatValue(extent.minimum).length,
    formatValue(extent.maximum).length
  );
  return Math.max(
    minimumValueAxisWidth,
    Math.ceil(longestLabelLength * tickCharacterWidth) + tickLabelGap
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
            width={valueAxisWidth(extent, formatAxisValue)}
            domain={valueDomain}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={formatAxisValue}
            // Recharts measures a tick with an unstyled span before wrapping it
            // at the axis width, so the size it renders at has to be explicit.
            tick={{ style: { fontSize: tickFontSize } }}
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
