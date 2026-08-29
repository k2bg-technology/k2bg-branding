import { cn } from '../../utils/cn';
import { seriesColorCss } from './chartTheme';
import { ChartColor } from './types';

const viewBoxSize = 100;

/** Leaves room for the round stroke cap at both ends of the value range. */
const topY = 5;
const bottomY = 95;

export interface SparklineProps {
  label: string;
  /** null breaks the line instead of interpolating across the gap. */
  values: (number | null)[];
  color?: ChartColor;
  className?: string;
}

interface SparklinePoint {
  x: number;
  y: number;
}

function buildRuns(values: (number | null)[]): SparklinePoint[][] {
  const measured = values.filter((value): value is number => value !== null);
  if (measured.length === 0) {
    return [];
  }

  const min = Math.min(...measured);
  const max = Math.max(...measured);
  const span = max - min;
  const xStep = values.length > 1 ? viewBoxSize / (values.length - 1) : 0;

  const toPoint = (value: number, index: number): SparklinePoint => {
    const normalized = span === 0 ? 0.5 : (value - min) / span;
    return { x: index * xStep, y: bottomY - normalized * (bottomY - topY) };
  };

  const runs = values.reduce<SparklinePoint[][]>(
    (openRuns, value, index) => {
      const currentRun = openRuns[openRuns.length - 1];
      if (value === null) {
        if (currentRun.length > 0) {
          openRuns.push([]);
        }
        return openRuns;
      }
      currentRun.push(toPoint(value, index));
      return openRuns;
    },
    [[]]
  );
  return runs.filter((run) => run.length > 0);
}

/** A lone measurement repeats its point so the round cap renders it as a dot. */
function toPointsAttribute(run: SparklinePoint[]): string {
  const points = run.length === 1 ? [run[0], run[0]] : run;
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

export function Sparkline({
  label,
  values,
  color = ChartColor.CHART_1,
  className,
}: SparklineProps) {
  const runs = buildRuns(values);
  const strokeColor = seriesColorCss(color);

  return (
    <svg
      role="img"
      aria-label={label}
      data-slot="sparkline"
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      preserveAspectRatio="none"
      className={cn('h-8 w-full', className)}
    >
      {runs.map((run) => (
        <polyline
          key={run[0].x}
          points={toPointsAttribute(run)}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          // The viewBox is stretched unevenly by preserveAspectRatio="none",
          // which would otherwise distort the stroke along with it.
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
