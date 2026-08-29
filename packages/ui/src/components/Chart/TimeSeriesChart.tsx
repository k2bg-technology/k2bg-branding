'use client';

import { useId } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  type DotItemDotProps,
  Line,
  ReferenceArea,
  ReferenceLine,
  Tooltip,
  type TooltipContentProps,
  type TooltipValueType,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartContainer } from './ChartContainer';
import { ChartLegend } from './ChartLegend';
import { ChartTooltip } from './ChartTooltip';
import { seriesDataKey } from './chartSeries';
import {
  chartAccessibleName,
  resolveSeriesColor,
  seriesColorCss,
} from './chartTheme';
import { defaultValueFormatter, getTimeAxisTicks } from './chartTicks';
import {
  ChartColor,
  type ChartHeight,
  ChartInterpolation,
  type ChartPeriod,
  type ChartReferenceBand,
  type ChartThreshold,
  type ChartTooltipData,
  type TimeSeriesBandPoint,
  type TimeSeriesBandSeries,
  type TimeSeriesChartSeries,
} from './types';

type TimeSeriesValue = number | [number, number] | null;
type TimeSeriesRow = { timestamp: number } & Record<string, TimeSeriesValue>;

function isBandSeries(
  series: TimeSeriesChartSeries
): series is TimeSeriesBandSeries {
  return series.kind === 'band';
}

// A half-measured range has no area to fill, so it becomes a gap like a null
// measurement rather than a band collapsed onto one bound.
function bandValue(point: TimeSeriesBandPoint): TimeSeriesValue {
  return point.low === null || point.high === null
    ? null
    : [point.low, point.high];
}

interface RowEntry {
  timestamp: number;
  dataKey: string;
  value: TimeSeriesValue;
}

function toRowEntries(seriesItem: TimeSeriesChartSeries): RowEntry[] {
  const dataKey = seriesDataKey(seriesItem.id);
  return isBandSeries(seriesItem)
    ? seriesItem.points.map((point) => ({
        timestamp: point.timestamp,
        dataKey,
        value: bandValue(point),
      }))
    : seriesItem.points.map((point) => ({
        timestamp: point.timestamp,
        dataKey,
        value: point.value,
      }));
}

function buildRows(series: TimeSeriesChartSeries[]): TimeSeriesRow[] {
  const rowsByTimestamp = series
    .flatMap(toRowEntries)
    .reduce((rows, { timestamp, dataKey, value }) => {
      const row = rows.get(timestamp) ?? { timestamp };
      row[dataKey] = value;
      return rows.set(timestamp, row);
    }, new Map<number, TimeSeriesRow>());

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

function formatTooltipValue(
  value: TooltipValueType | undefined,
  valueFormatter: (value: number) => string
): string | null {
  if (Array.isArray(value)) {
    const [low, high] = value;
    if (typeof low !== 'number' || typeof high !== 'number') {
      return null;
    }
    return `${valueFormatter(low)}–${valueFormatter(high)}`;
  }
  return typeof value === 'number' ? valueFormatter(value) : null;
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
  series: TimeSeriesChartSeries[];
  period: ChartPeriod;
  variant?: 'line' | 'area';
  thresholds?: ChartThreshold[];
  bands?: ChartReferenceBand[];
  /** IANA time zone name, e.g. 'Asia/Tokyo'. */
  timeZone?: string;
  interpolation?: ChartInterpolation;
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
  thresholds,
  bands,
  timeZone = 'UTC',
  interpolation = ChartInterpolation.LINEAR,
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
    period,
    timeZone
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
  const curveType = (seriesItem: TimeSeriesChartSeries) =>
    seriesItem.interpolation ?? interpolation;

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
      if (seriesInfo === undefined) {
        return [];
      }
      const displayValue = formatTooltipValue(entry.value, valueFormatter);
      if (displayValue === null) {
        return [];
      }
      return {
        id: seriesInfo.id,
        label: seriesInfo.label,
        color: seriesInfo.color,
        value: displayValue,
      };
    }),
  });

  const gradientSeries =
    variant === 'area' ? series.filter((item) => !isBandSeries(item)) : [];

  const isLegendVisible = showLegend ?? series.length > 1;
  const legendItems = series.map((seriesItem) => ({
    id: seriesItem.id,
    label: seriesItem.label,
    color: seriesColor(seriesItem.id) ?? '',
  }));

  return (
    <div data-slot="time-series-chart" className={className}>
      <ChartContainer height={height}>
        <ComposedChart
          data={rows}
          margin={{ left: 12, right: 12 }}
          {...chartAccessibleName(label)}
        >
          <defs>
            {gradientSeries.map((seriesItem) => (
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
          <CartesianGrid vertical={false} />
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
          {/* Lines may sit far from zero; fit the domain to the data
              (bars keep the mandatory zero baseline in BarChart). */}
          <YAxis
            width={48}
            domain={['auto', 'auto']}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={valueFormatter}
          />
          <Tooltip
            content={(tooltipProps: TooltipContentProps) => {
              if (!tooltipProps.active || tooltipProps.payload?.length === 0) {
                return null;
              }
              return <ChartTooltip data={toTooltipData(tooltipProps)} />;
            }}
            isAnimationActive={false}
          />
          {(bands ?? []).map((band) => (
            <ReferenceArea
              key={band.id}
              y1={band.from}
              y2={band.to}
              // Without it a reference that sits outside the measured range
              // is silently dropped instead of widening the axis.
              ifOverflow="extendDomain"
              fill={seriesColorCss(band.color ?? ChartColor.INFO)}
              fillOpacity={0.08}
              stroke="none"
            />
          ))}
          {(thresholds ?? []).map((threshold) => (
            <ReferenceLine
              key={threshold.id}
              y={threshold.value}
              ifOverflow="extendDomain"
              stroke={seriesColorCss(threshold.color ?? ChartColor.WARNING)}
              strokeDasharray="4 4"
              label={
                threshold.label === undefined
                  ? undefined
                  : {
                      value: threshold.label,
                      position: 'insideTopRight',
                      fontSize: 12,
                      fill: 'var(--color-base-black)',
                      fillOpacity: 0.8,
                    }
              }
            />
          ))}
          {series.map((seriesItem) => {
            if (isBandSeries(seriesItem)) {
              return (
                <Area
                  key={seriesItem.id}
                  dataKey={seriesDataKey(seriesItem.id)}
                  type={curveType(seriesItem)}
                  fill={seriesColor(seriesItem.id)}
                  fillOpacity={seriesItem.fillOpacity ?? 0.2}
                  stroke="none"
                  activeDot={false}
                  connectNulls={false}
                  isAnimationActive={animated}
                />
              );
            }
            if (variant === 'area') {
              return (
                <Area
                  key={seriesItem.id}
                  dataKey={seriesDataKey(seriesItem.id)}
                  type={curveType(seriesItem)}
                  fill={`url(#${gradientId(seriesItem.id)})`}
                  fillOpacity={0.4}
                  stroke={seriesColor(seriesItem.id)}
                  strokeWidth={2}
                  dot={isolatedPointDot(seriesItem.id)}
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                  isAnimationActive={animated}
                />
              );
            }
            return (
              <Line
                key={seriesItem.id}
                dataKey={seriesDataKey(seriesItem.id)}
                type={curveType(seriesItem)}
                stroke={seriesColor(seriesItem.id)}
                strokeWidth={2}
                dot={isolatedPointDot(seriesItem.id)}
                activeDot={{ r: 4 }}
                connectNulls={false}
                isAnimationActive={animated}
              />
            );
          })}
        </ComposedChart>
      </ChartContainer>
      {isLegendVisible && <ChartLegend items={legendItems} />}
    </div>
  );
}
