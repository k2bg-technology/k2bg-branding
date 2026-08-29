'use client';

import {
  CartesianGrid,
  ScatterChart as RechartsScatterChart,
  ReferenceLine,
  type ReferenceLineSegment,
  Scatter,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartContainer } from './ChartContainer';
import { ChartLegend } from './ChartLegend';
import { ChartTooltip } from './ChartTooltip';
import {
  chartAccessibleName,
  resolveSeriesColor,
  seriesColorCss,
} from './chartTheme';
import { defaultValueFormatter } from './chartTicks';
import { ChartColor, type ChartHeight, type ChartTooltipData } from './types';

export interface ScatterChartPoint {
  x: number;
  y: number;
}

export interface ScatterChartSeries {
  id: string;
  label: string;
  color?: ChartColor;
  points: ScatterChartPoint[];
}

export interface ScatterChartTrendLine {
  /** Fitted by the consuming app; the chart only draws it. */
  slope: number;
  intercept: number;
  color?: ChartColor;
}

type ScatterRow = ScatterChartPoint & { seriesId: string };

function hoveredRow(
  payload: TooltipContentProps['payload']
): ScatterRow | undefined {
  const row: unknown = payload?.[0]?.payload;
  if (
    typeof row === 'object' &&
    row !== null &&
    'x' in row &&
    'y' in row &&
    'seriesId' in row &&
    typeof row.x === 'number' &&
    typeof row.y === 'number' &&
    typeof row.seriesId === 'string'
  ) {
    return { x: row.x, y: row.y, seriesId: row.seriesId };
  }
  return undefined;
}

interface HorizontalExtent {
  min: number;
  max: number;
}

function horizontalExtent(
  series: ScatterChartSeries[]
): HorizontalExtent | undefined {
  const xValues = series.flatMap((seriesItem) =>
    seriesItem.points.map((point) => point.x)
  );
  const min = Math.min(...xValues);
  const max = Math.max(...xValues);
  return min <= max ? { min, max } : undefined;
}

// The trend line spans the plotted data, not the axis domain.
function trendLineSegment(
  trendLine: ScatterChartTrendLine,
  extent: HorizontalExtent
): ReferenceLineSegment {
  return [
    { x: extent.min, y: trendLine.slope * extent.min + trendLine.intercept },
    { x: extent.max, y: trendLine.slope * extent.max + trendLine.intercept },
  ];
}

export interface ScatterChartProps {
  label: string;
  xLabel: string;
  yLabel: string;
  series: ScatterChartSeries[];
  trendLine?: ScatterChartTrendLine;
  height?: ChartHeight;
  xValueFormatter?: (value: number) => string;
  yValueFormatter?: (value: number) => string;
  showLegend?: boolean;
  animated?: boolean;
  className?: string;
}

export function ScatterChart({
  label,
  xLabel,
  yLabel,
  series,
  trendLine,
  height,
  xValueFormatter = defaultValueFormatter,
  yValueFormatter = defaultValueFormatter,
  showLegend,
  animated = false,
  className,
}: ScatterChartProps) {
  const seriesColorById = new Map(
    series.map((seriesItem, index) => [
      seriesItem.id,
      resolveSeriesColor(seriesItem, index),
    ])
  );
  const rowsFor = (seriesItem: ScatterChartSeries): ScatterRow[] =>
    seriesItem.points.map((point) => ({ ...point, seriesId: seriesItem.id }));

  const extent = horizontalExtent(series);

  const toTooltipData = (
    tooltipProps: TooltipContentProps
  ): ChartTooltipData => {
    const row = hoveredRow(tooltipProps.payload);
    const seriesItem = series.find(
      (candidate) => candidate.id === row?.seriesId
    );
    if (row === undefined || seriesItem === undefined) {
      return { heading: '', items: [] };
    }
    const color = seriesColorById.get(seriesItem.id) ?? '';
    return {
      heading: seriesItem.label,
      items: [
        {
          id: `${seriesItem.id}-x`,
          label: xLabel,
          color,
          value: xValueFormatter(row.x),
        },
        {
          id: `${seriesItem.id}-y`,
          label: yLabel,
          color,
          value: yValueFormatter(row.y),
        },
      ],
    };
  };

  const isLegendVisible = showLegend ?? series.length > 1;
  const legendItems = series.map((seriesItem) => ({
    id: seriesItem.id,
    label: seriesItem.label,
    color: seriesColorById.get(seriesItem.id) ?? '',
  }));

  return (
    <div data-slot="scatter-chart" className={className}>
      <ChartContainer height={height}>
        <RechartsScatterChart
          // The top tick sits on the very edge, so its label needs the margin.
          margin={{ top: 8, left: 12, right: 12 }}
          {...chartAccessibleName(label)}
        >
          {/* Both measures are quantitative, so the vertical grid lines
              carry as much meaning as the horizontal ones. */}
          <CartesianGrid />
          <XAxis
            dataKey="x"
            type="number"
            domain={['auto', 'auto']}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={xValueFormatter}
          />
          <YAxis
            dataKey="y"
            type="number"
            width={48}
            domain={['auto', 'auto']}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={yValueFormatter}
          />
          <Tooltip
            content={(tooltipProps: TooltipContentProps) => {
              if (!tooltipProps.active || tooltipProps.payload?.length === 0) {
                return null;
              }
              return <ChartTooltip data={toTooltipData(tooltipProps)} />;
            }}
            cursor={false}
            isAnimationActive={false}
          />
          {trendLine !== undefined && extent !== undefined && (
            <ReferenceLine
              segment={trendLineSegment(trendLine, extent)}
              ifOverflow="hidden"
              strokeDasharray="6 4"
              stroke={seriesColorCss(trendLine.color ?? ChartColor.INFO)}
            />
          )}
          {series.map((seriesItem) => (
            <Scatter
              key={seriesItem.id}
              data={rowsFor(seriesItem)}
              fill={seriesColorById.get(seriesItem.id)}
              isAnimationActive={animated}
            />
          ))}
        </RechartsScatterChart>
      </ChartContainer>
      {isLegendVisible && <ChartLegend items={legendItems} />}
    </div>
  );
}
