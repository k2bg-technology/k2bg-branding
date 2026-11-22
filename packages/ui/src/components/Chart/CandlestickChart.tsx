'use client';

import {
  Bar,
  type BarShapeProps,
  CartesianGrid,
  BarChart as RechartsBarChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartContainer } from './ChartContainer';
import { ChartTooltip } from './ChartTooltip';
import { numericExtent } from './chartExtent';
import { chartAccessibleName, seriesColorCss } from './chartTheme';
import {
  defaultValueFormatter,
  formatFullDate,
  getTimeAxisTicks,
  valueAxisTick,
  valueAxisWidth,
} from './chartTicks';
import {
  type CandlestickDatum,
  type CandlestickLabels,
  ChartColor,
  type ChartHeight,
  type ChartPeriod,
} from './types';

interface Props {
  /** Accessible name of the chart, already localized by the consuming app. */
  label: string;
  candles: CandlestickDatum[];
  labels: CandlestickLabels;
  period: ChartPeriod;
  /** IANA time zone name; defaults to 'UTC'. */
  timeZone?: string;
  /** BCP 47 locale for axis ticks and tooltip headings. */
  locale?: string;
  /** Color of a candle that closes above its open; defaults to ChartColor.SUCCESS. */
  upColor?: ChartColor;
  /** Color of a candle that closes below its open; defaults to ChartColor.ERROR. */
  downColor?: ChartColor;
  height?: ChartHeight;
  valueFormatter?: (value: number) => string;
  /** Formats the value-axis ticks; defaults to valueFormatter. */
  axisValueFormatter?: (value: number) => string;
  animated?: boolean;
  className?: string;
}

type CandleMark =
  | { direction: 'close-only'; close: number }
  | {
      direction: 'up' | 'down' | 'flat';
      open: number;
      high: number;
      low: number;
      close: number;
    };

const neutralColor = 'var(--color-chart-overflow)';
const valueKeys = ['open', 'high', 'low', 'close'] as const;

function bodyDirection(open: number, close: number) {
  if (close === open) {
    return 'flat';
  }
  return close > open ? 'up' : 'down';
}

function candleMark({
  open,
  high,
  low,
  close,
}: CandlestickDatum): CandleMark | null {
  if (close === null) {
    return null;
  }
  if (open === null || high === null || low === null) {
    return { direction: 'close-only', close };
  }
  return { direction: bodyDirection(open, close), open, high, low, close };
}

interface CandleRow {
  timestamp: number;
  mark: CandleMark | null;
  range: [number, number] | null;
}

function candleShape(
  { x, y, width, height }: BarShapeProps,
  mark: CandleMark,
  [minimum, maximum]: [number, number],
  color: string
) {
  const center = x + width / 2;
  const hasHollowBody = mark.direction === 'up';
  const bodyStrokeWidth = 1;
  // Preserve two pixels of fill inside the centered stroke on both axes.
  const minimumBodySize = hasHollowBody ? bodyStrokeWidth + 2 : 1;
  const bodyWidth = Math.max(minimumBodySize, width);
  const left = center - bodyWidth / 2;
  // Map the candle values onto the range bar's pixel extent, including during
  // animation. A zero-height value range still anchors a visible mark.
  const position = (value: number) =>
    minimum === maximum
      ? y
      : y + (height * (maximum - value)) / (maximum - minimum);

  if (mark.direction === 'close-only') {
    const close = position(mark.close);
    return (
      <line
        data-slot="candlestick-candle"
        data-direction={mark.direction}
        x1={left}
        x2={left + bodyWidth}
        y1={close}
        y2={close}
        stroke={color}
        strokeWidth={1}
      />
    );
  }

  const open = position(mark.open);
  const close = position(mark.close);
  const bodyHeight = Math.max(minimumBodySize, Math.abs(open - close));
  return (
    <g data-slot="candlestick-candle" data-direction={mark.direction}>
      <line
        x1={center}
        x2={center}
        y1={position(mark.high)}
        y2={position(mark.low)}
        stroke={color}
        strokeWidth={1}
      />
      <rect
        x={left}
        y={(open + close - bodyHeight) / 2}
        width={bodyWidth}
        height={bodyHeight}
        fill={hasHollowBody ? 'var(--color-base-white)' : color}
        stroke={color}
        strokeWidth={bodyStrokeWidth}
      />
    </g>
  );
}

export function CandlestickChart({
  label,
  candles,
  labels,
  period,
  timeZone = 'UTC',
  locale,
  upColor = ChartColor.SUCCESS,
  downColor = ChartColor.ERROR,
  height,
  valueFormatter = defaultValueFormatter,
  axisValueFormatter = valueFormatter,
  animated = false,
  className,
}: Props) {
  const rowsByTimestamp = new Map<number, CandleRow>();
  for (const candle of candles) {
    const extent = numericExtent(
      valueKeys.map((key) => candle[key]).filter((value) => value !== null)
    );
    rowsByTimestamp.set(candle.timestamp, {
      timestamp: candle.timestamp,
      mark: candleMark(candle),
      range: extent ? [extent.minimum, extent.maximum] : null,
    });
  }
  const rows = Array.from(rowsByTimestamp.values()).sort(
    (first, second) => first.timestamp - second.timestamp
  );
  const { ticks, formatTick } = getTimeAxisTicks(
    rows.map((row) => row.timestamp),
    period,
    timeZone,
    locale
  );
  const extent = numericExtent(rows.flatMap((row) => row.range ?? []));
  const directionColors = {
    up: seriesColorCss(upColor),
    down: seriesColorCss(downColor),
    flat: neutralColor,
    'close-only': neutralColor,
  };

  return (
    <div data-slot="candlestick-chart" className={className}>
      <ChartContainer height={height}>
        <RechartsBarChart
          data={rows}
          barCategoryGap="15%"
          margin={{ left: 12, right: 12 }}
          {...chartAccessibleName(label)}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="timestamp"
            type="category"
            ticks={ticks}
            tickFormatter={formatTick}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={16}
          />
          <YAxis
            width={valueAxisWidth(
              extent ? [extent.minimum, extent.maximum] : [0],
              axisValueFormatter
            )}
            domain={['auto', 'auto']}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={axisValueFormatter}
            tick={valueAxisTick}
          />
          <Tooltip
            content={({ active, label: activeTimestamp }) => {
              if (!active || typeof activeTimestamp !== 'number') {
                return null;
              }
              const mark = rowsByTimestamp.get(activeTimestamp)?.mark;
              if (!mark) {
                return null;
              }
              const entries =
                mark.direction === 'close-only'
                  ? [['close', mark.close] as const]
                  : valueKeys.map((key) => [key, mark[key]] as const);
              const color = directionColors[mark.direction];
              return (
                <ChartTooltip
                  data={{
                    heading: formatFullDate(
                      activeTimestamp,
                      period,
                      timeZone,
                      locale
                    ),
                    items: entries.map(([key, value]) => ({
                      id: key,
                      label: labels[key],
                      color,
                      value: valueFormatter(value),
                    })),
                  }}
                />
              );
            }}
            cursor={false}
            isAnimationActive={false}
          />
          {/* A range bar fits the axis to every measurement, even across unmarked slots. */}
          <Bar
            dataKey="range"
            isAnimationActive={animated ? 'auto' : false}
            shape={(shape: BarShapeProps) => {
              const timestamp: unknown = shape.payload?.timestamp;
              const row =
                typeof timestamp === 'number'
                  ? rowsByTimestamp.get(timestamp)
                  : undefined;
              if (!row?.mark || !row.range) {
                return null;
              }
              return candleShape(
                shape,
                row.mark,
                row.range,
                directionColors[row.mark.direction]
              );
            }}
          />
        </RechartsBarChart>
      </ChartContainer>
    </div>
  );
}

export type { Props as CandlestickChartProps };
