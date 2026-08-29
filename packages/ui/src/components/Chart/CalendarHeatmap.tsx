import { cn } from '../../utils/cn';
import {
  type HeatmapScaleLabels,
  heatmapCellColor,
  heatmapLevel,
} from './chartHeatmapScale';
import { defaultValueFormatter } from './chartTicks';
import { HeatmapScaleLegend } from './HeatmapScaleLegend';
import { ChartColor } from './types';

const dayMs = 86_400_000;
const daysPerWeek = 7;

/** Mon/Wed/Fri only, so labels never collide at a 12px row height. */
const labelledWeekdayRows = [0, 2, 4];

export interface CalendarHeatmapDay {
  /** ISO `YYYY-MM-DD`; an opaque calendar day that is never shifted between time zones. */
  date: string;
  /** null renders an outlined empty cell, distinct from a zero-value cell. */
  value: number | null;
}

export interface CalendarHeatmapProps {
  label: string;
  days: CalendarHeatmapDay[];
  color?: ChartColor;
  /** Top of the color scale; defaults to the largest value in `days`. */
  max?: number;
  valueFormatter?: (value: number) => string;
  /** Seven names, Monday first. */
  weekdayLabels?: string[];
  scaleLabels?: HeatmapScaleLabels;
  className?: string;
}

/** Calendar days are pinned to UTC midnight so day arithmetic never meets a DST shift. */
function toUtcMidnight(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function toIsoDate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function weekdayIndex(timestamp: number): number {
  return (new Date(timestamp).getUTCDay() + 6) % daysPerWeek;
}

function buildCells(days: CalendarHeatmapDay[]): CalendarHeatmapDay[] {
  if (days.length === 0) {
    return [];
  }

  const valueByDate = new Map(days.map((day) => [day.date, day.value]));
  const timestamps = days.map((day) => toUtcMidnight(day.date));
  const firstDay = Math.min(...timestamps);
  const lastDay = Math.max(...timestamps);
  const gridStart = firstDay - weekdayIndex(firstDay) * dayMs;
  const gridEnd = lastDay + (daysPerWeek - 1 - weekdayIndex(lastDay)) * dayMs;

  const dayCount = (gridEnd - gridStart) / dayMs + 1;
  return Array.from({ length: dayCount }, (_, index) => {
    const date = toIsoDate(gridStart + index * dayMs);
    return { date, value: valueByDate.get(date) ?? null };
  });
}

export function CalendarHeatmap({
  label,
  days,
  color = ChartColor.CHART_1,
  max,
  valueFormatter = defaultValueFormatter,
  weekdayLabels,
  scaleLabels,
  className,
}: CalendarHeatmapProps) {
  const cells = buildCells(days);
  const measuredValues = days
    .map((day) => day.value)
    .filter((value): value is number => value !== null);
  const scaleMax =
    max ?? (measuredValues.length > 0 ? Math.max(...measuredValues) : 0);

  return (
    <div
      role="img"
      aria-label={label}
      data-slot="calendar-heatmap"
      className={cn('inline-flex flex-col gap-2', className)}
    >
      <div className="flex gap-1">
        {weekdayLabels && (
          <div className="grid grid-rows-7 gap-0.5 text-caption leading-3 text-base-black/80">
            {weekdayLabels.map((weekdayLabel, index) => (
              <span key={weekdayLabel} className="h-3">
                {labelledWeekdayRows.includes(index) ? weekdayLabel : ''}
              </span>
            ))}
          </div>
        )}
        <div className="grid grid-flow-col grid-rows-7 gap-0.5">
          {cells.map((cell) =>
            cell.value === null ? (
              <span
                key={cell.date}
                data-slot="calendar-heatmap-cell"
                className="h-3 w-3 rounded-xs border border-base-light"
              />
            ) : (
              <span
                key={cell.date}
                data-slot="calendar-heatmap-cell"
                title={`${cell.date}: ${valueFormatter(cell.value)}`}
                className="h-3 w-3 rounded-xs"
                style={{
                  backgroundColor: heatmapCellColor(
                    heatmapLevel(cell.value, 0, scaleMax),
                    color
                  ),
                }}
              />
            )
          )}
        </div>
      </div>
      {scaleLabels && <HeatmapScaleLegend color={color} labels={scaleLabels} />}
    </div>
  );
}
