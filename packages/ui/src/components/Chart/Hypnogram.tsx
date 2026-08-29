import { cn } from '../../utils/cn';
import { seriesColorCss } from './chartTheme';
import { formatTimestamp } from './chartTicks';
import { ChartColor, ChartPeriod } from './types';

export const HypnogramStage = {
  AWAKE: 'awake',
  REM: 'rem',
  CORE: 'core',
  DEEP: 'deep',
} as const;
export type HypnogramStage =
  (typeof HypnogramStage)[keyof typeof HypnogramStage];

export interface HypnogramSegment {
  /** Epoch milliseconds, inclusive. */
  start: number;
  /** Epoch milliseconds, exclusive. */
  end: number;
  stage: HypnogramStage;
}

export interface HypnogramProps {
  label: string;
  segments: HypnogramSegment[];
  stageLabels: Record<HypnogramStage, string>;
  /** IANA time zone name. */
  timeZone?: string;
  stageColors?: Partial<Record<HypnogramStage, ChartColor>>;
  className?: string;
}

const stageOrder: HypnogramStage[] = [
  HypnogramStage.AWAKE,
  HypnogramStage.REM,
  HypnogramStage.CORE,
  HypnogramStage.DEEP,
];

const defaultStageColors: Record<HypnogramStage, ChartColor> = {
  awake: ChartColor.WARNING,
  rem: ChartColor.INFO,
  core: ChartColor.CHART_1,
  deep: ChartColor.CHART_3,
};

const viewBoxWidth = 640;
const viewBoxHeight = 220;
const plotStartX = 72;
const plotEndX = 632;
const firstRowY = 36;
const rowGap = 40;
const axisY = 186;
const tickLength = 4;
const tickLabelY = 204;
const minuteMs = 60_000;
const hourMs = 3_600_000;
const maxHourTicks = 6;

/** Half of an `HH:MM` label at `tickLabelFontSize`, measured at 28.75 and rounded up. */
const tickLabelHalfWidth = 15;
const tickLabelFontSize = 10;
const tickLabelGap = 4;

function stageRowY(stage: HypnogramStage): number {
  return firstRowY + stageOrder.indexOf(stage) * rowGap;
}

/** Edge labels anchor inward, since a centered one would run past the viewBox. */
function tickTextAnchor(x: number): 'start' | 'middle' | 'end' {
  if (x - tickLabelHalfWidth < 0) {
    return 'start';
  }
  if (x + tickLabelHalfWidth > viewBoxWidth) {
    return 'end';
  }
  return 'middle';
}

function tickLabelExtent(x: number): { left: number; right: number } {
  switch (tickTextAnchor(x)) {
    case 'start':
      return { left: x, right: x + tickLabelHalfWidth * 2 };
    case 'end':
      return { left: x - tickLabelHalfWidth * 2, right: x };
    case 'middle':
      return { left: x - tickLabelHalfWidth, right: x + tickLabelHalfWidth };
  }
}

// Anchoring the endpoints inward pulls them over their neighbors, and the
// start and end of the night matter more than the hour beside them.
function withoutCollidingLabels(
  ticks: number[],
  plotX: (timestamp: number) => number
): number[] {
  if (ticks.length <= 2) {
    return ticks;
  }

  const first = tickLabelExtent(plotX(ticks[0]));
  const last = tickLabelExtent(plotX(ticks[ticks.length - 1]));
  return ticks.filter((tick, index) => {
    if (index === 0 || index === ticks.length - 1) {
      return true;
    }
    const extent = tickLabelExtent(plotX(tick));
    return (
      extent.left > first.right + tickLabelGap &&
      extent.right < last.left - tickLabelGap
    );
  });
}

/**
 * Hour boundaries are wall-clock rather than UTC, so zones offset by 30 or 45
 * minutes do not land every tick mid-hour.
 */
function wallClockMinute(timestamp: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date(timestamp));
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '0';
  return Number(minute);
}

function nextWholeHour(timestamp: number, timeZone: string): number {
  const startOfMinute = Math.ceil(timestamp / minuteMs) * minuteMs;
  const minute = wallClockMinute(startOfMinute, timeZone);
  return startOfMinute + ((60 - minute) % 60) * minuteMs;
}

function buildTimeTicks(
  startTime: number,
  endTime: number,
  timeZone: string
): number[] {
  const wholeHour = nextWholeHour(startTime, timeZone);
  const firstTick = wholeHour === startTime ? wholeHour + hourMs : wholeHour;
  const hourTickCount = Math.max(0, Math.ceil((endTime - firstTick) / hourMs));
  const hourTicks = Array.from(
    { length: hourTickCount },
    (_, index) => firstTick + index * hourMs
  );

  const step = Math.max(1, Math.ceil(hourTicks.length / maxHourTicks));
  return [
    startTime,
    ...hourTicks.filter((_, index) => index % step === 0),
    endTime,
  ];
}

export function Hypnogram({
  label,
  segments,
  stageLabels,
  timeZone = 'UTC',
  stageColors,
  className,
}: HypnogramProps) {
  const sortedSegments = [...segments].sort(
    (first, second) => first.start - second.start
  );
  const startTime = sortedSegments[0]?.start ?? 0;
  const endTime = sortedSegments[sortedSegments.length - 1]?.end ?? 0;
  const span = endTime - startTime;

  const plotX = (timestamp: number) =>
    span <= 0
      ? plotStartX
      : plotStartX + ((timestamp - startTime) / span) * (plotEndX - plotStartX);
  const stageColor = (stage: HypnogramStage) =>
    seriesColorCss(stageColors?.[stage] ?? defaultStageColors[stage]);
  const timeTicks =
    span <= 0
      ? []
      : withoutCollidingLabels(
          buildTimeTicks(startTime, endTime, timeZone),
          plotX
        );

  return (
    <svg
      role="img"
      aria-label={label}
      data-slot="hypnogram"
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      className={cn('w-full', className)}
    >
      {stageOrder.map((stage) => (
        <g key={stage}>
          <text
            x={plotStartX - 8}
            y={stageRowY(stage) + 4}
            textAnchor="end"
            fontSize={12}
            fill="var(--color-base-black)"
            fillOpacity={0.8}
          >
            {stageLabels[stage]}
          </text>
          <line
            x1={plotStartX}
            x2={plotEndX}
            y1={stageRowY(stage)}
            y2={stageRowY(stage)}
            stroke="var(--color-base-light)"
            strokeWidth={1}
          />
        </g>
      ))}
      {sortedSegments.map((segment, index) => (
        <g key={segment.start}>
          {index > 0 && (
            <line
              x1={plotX(segment.start)}
              x2={plotX(segment.start)}
              y1={stageRowY(sortedSegments[index - 1].stage)}
              y2={stageRowY(segment.stage)}
              stroke="var(--color-base-light)"
              strokeWidth={1}
            />
          )}
          <line
            data-slot="hypnogram-segment"
            x1={plotX(segment.start)}
            x2={plotX(segment.end)}
            y1={stageRowY(segment.stage)}
            y2={stageRowY(segment.stage)}
            stroke={stageColor(segment.stage)}
            strokeWidth={6}
            strokeLinecap="round"
          />
        </g>
      ))}
      {timeTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={plotX(tick)}
            x2={plotX(tick)}
            y1={axisY}
            y2={axisY + tickLength}
            stroke="var(--color-base-light)"
            strokeWidth={1}
          />
          <text
            x={plotX(tick)}
            y={tickLabelY}
            textAnchor={tickTextAnchor(plotX(tick))}
            fontSize={tickLabelFontSize}
            fill="var(--color-base-black)"
            fillOpacity={0.8}
          >
            {formatTimestamp(tick, ChartPeriod.DAY, timeZone)}
          </text>
        </g>
      ))}
    </svg>
  );
}
