'use client';

import { useId } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  type DotItemDotProps,
  Line,
  LineChart,
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
import { defaultValueFormatter, getTimeAxisTicks } from './chartTicks';
import type {
  ChartHeight,
  ChartPeriod,
  ChartTooltipData,
  TimeSeriesSeries,
} from './types';

type TimeSeriesRow = { timestamp: number } & Record<string, number | null>;

function buildRows(series: TimeSeriesSeries[]): TimeSeriesRow[] {
  const rowsByTimestamp = new Map<number, TimeSeriesRow>();
  for (const seriesItem of series) {
    for (const point of seriesItem.points) {
      const row = rowsByTimestamp.get(point.timestamp) ?? {
        timestamp: point.timestamp,
      };
      row[seriesDataKey(seriesItem.id)] = point.value;
      rowsByTimestamp.set(point.timestamp, row);
    }
  }
  return Array.from(rowsByTimestamp.values()).sort(
    (first, second) => first.timestamp - second.timestamp
  );
}

// A measurement whose neighbours are gaps never gets a line segment, so it
// needs its own marker or it silently vanishes from the chart.
function isolatedTimestamps(
  rows: TimeSeriesRow[],
  dataKey: string
): Set<number> {
  const hasValue = (index: number) =>
    typeof rows[index]?.[dataKey] === 'number';
  const isolated = new Set<number>();
  rows.forEach((row, index) => {
    if (hasValue(index) && !hasValue(index - 1) && !hasValue(index + 1)) {
      isolated.add(row.timestamp);
    }
  });
  return isolated;
}

function renderIsolatedPointDot(timestamps: Set<number>, color: string) {
  return ({ cx, cy, payload, index }: DotItemDotProps) =>
    timestamps.has(payload.timestamp) ? (
      <circle
        key={index}
        className="recharts-dot"
        cx={cx}
        cy={cy}
        r={3}
        fill={color}
        stroke="none"
      />
    ) : null;
}

export interface TimeSeriesChartProps {
  /** Accessible name of the chart, already localized by the consuming app. */
  label: string;
  series: TimeSeriesSeries[];
  period: ChartPeriod;
  variant?: 'line' | 'area';
  height?: ChartHeight;
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  animated?: boolean;
  className?: string;
}

export function TimeSeriesChart({
  label,
  series,
  period,
  variant = 'line',
  height,
  valueFormatter = defaultValueFormatter,
  showLegend,
  animated = false,
  className,
}: TimeSeriesChartProps) {
  // Gradient defs need a document-unique id per chart instance.
  const gradientIdPrefix = useId().replace(/[^a-zA-Z0-9-]/g, '');
  const gradientId = (seriesId: string) =>
    `chart-fill-${gradientIdPrefix}-${seriesId}`;

  const rows = buildRows(series);
  const { ticks, formatTick } = getTimeAxisTicks(
    rows.map((row) => row.timestamp),
    period
  );
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
  const isolatedPointDot = (seriesId: string) =>
    renderIsolatedPointDot(
      isolatedTimestamps(rows, seriesDataKey(seriesId)),
      seriesColor(seriesId) ?? 'currentColor'
    );

  const toTooltipData = ({
    label: hoveredTimestamp,
    payload,
  }: TooltipContentProps): ChartTooltipData => ({
    heading:
      typeof hoveredTimestamp === 'number'
        ? formatTick(hoveredTimestamp)
        : String(hoveredTimestamp ?? ''),
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

  const grid = <CartesianGrid vertical={false} />;
  const timeAxis = (
    <XAxis
      dataKey="timestamp"
      type="number"
      scale="time"
      domain={['dataMin', 'dataMax']}
      ticks={ticks}
      tickFormatter={formatTick}
      tickLine={false}
      axisLine={false}
      tickMargin={8}
      minTickGap={16}
    />
  );
  const valueAxis = (
    // Lines may sit far from zero; fit the domain to the data
    // (bars keep the mandatory zero baseline in BarChart).
    <YAxis
      width={48}
      domain={['auto', 'auto']}
      tickLine={false}
      axisLine={false}
      tickMargin={8}
      tickFormatter={valueFormatter}
    />
  );
  const tooltip = (
    <Tooltip content={renderTooltipContent} isAnimationActive={false} />
  );
  const margin = { left: 12, right: 12 };
  const accessibleName = chartAccessibleName(label);

  const chart =
    variant === 'area' ? (
      <AreaChart data={rows} margin={margin} {...accessibleName}>
        <defs>
          {series.map((seriesItem) => (
            <linearGradient
              key={seriesItem.id}
              id={gradientId(seriesItem.id)}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={seriesColor(seriesItem.id)}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={seriesColor(seriesItem.id)}
                stopOpacity={0.1}
              />
            </linearGradient>
          ))}
        </defs>
        {grid}
        {timeAxis}
        {valueAxis}
        {tooltip}
        {series.map((seriesItem) => (
          <Area
            key={seriesItem.id}
            dataKey={seriesDataKey(seriesItem.id)}
            type="natural"
            fill={`url(#${gradientId(seriesItem.id)})`}
            fillOpacity={0.4}
            stroke={seriesColor(seriesItem.id)}
            strokeWidth={2}
            dot={isolatedPointDot(seriesItem.id)}
            activeDot={{ r: 4 }}
            connectNulls={false}
            isAnimationActive={animated}
          />
        ))}
      </AreaChart>
    ) : (
      <LineChart data={rows} margin={margin} {...accessibleName}>
        {grid}
        {timeAxis}
        {valueAxis}
        {tooltip}
        {series.map((seriesItem) => (
          <Line
            key={seriesItem.id}
            dataKey={seriesDataKey(seriesItem.id)}
            type="natural"
            stroke={seriesColor(seriesItem.id)}
            strokeWidth={2}
            dot={isolatedPointDot(seriesItem.id)}
            activeDot={{ r: 4 }}
            connectNulls={false}
            isAnimationActive={animated}
          />
        ))}
      </LineChart>
    );

  const isLegendVisible = showLegend ?? series.length > 1;
  const legendItems = series.map((seriesItem) => ({
    id: seriesItem.id,
    label: seriesItem.label,
    color: seriesColor(seriesItem.id) ?? '',
  }));

  return (
    <div data-slot="time-series-chart" className={className}>
      <ChartContainer height={height}>{chart}</ChartContainer>
      {isLegendVisible && <ChartLegend items={legendItems} />}
    </div>
  );
}
