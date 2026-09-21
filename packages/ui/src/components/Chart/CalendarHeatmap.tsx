'use client';

import { Fragment, useId } from 'react';

import { cn } from '../../utils/cn';
import { ScrollArea } from '../ScrollArea';
import {
  calendarMonthLabels,
  localeWeekdayNames,
  resolveWeekStart,
  type WeekStartDay,
  weekdayOffset,
} from './chartCalendarLabels';
import {
  type HeatmapScaleLabels,
  heatmapCellColor,
  heatmapEmptyCellBackgroundImage,
  heatmapLevel,
} from './chartHeatmapScale';
import { defaultValueFormatter } from './chartTicks';
import { HeatmapScaleLegend } from './HeatmapScaleLegend';
import { ChartColor } from './types';

const dayMs = 86_400_000;
const daysPerWeek = 7;
const defaultCellSize = 12;
/** Matches the `gap-0.5` between cells, so a month label knows its column pitch. */
const cellGap = 2;
/** One height for the month-label row on both sides, so the rows below it line up. */
const headerRowHeight = 16;

/** Mon/Wed/Fri only, so labels never collide at the smallest row height. */
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
  /** Seven names in display order; wins over the names `locale` would give. */
  weekdayLabels?: string[];
  /** BCP 47 tag for weekday and month names and for the first day of the week. */
  locale?: string;
  /** Overrides the locale's first day of the week; 0 is Sunday. */
  weekStartsOn?: WeekStartDay;
  /** Month names above the week column each month starts in. */
  showMonthLabels?: boolean;
  /** Shown for days without a measurement, already localized by the app. */
  emptyLabel?: string;
  /** Smallest cell edge in px; the grid scrolls rather than going below it. */
  minimumCellSize?: number;
  /** Largest cell edge in px; the grid stops growing there in a wide container. */
  maximumCellSize?: number;
  scaleLabels?: HeatmapScaleLabels;
  className?: string;
}

/** Calendar days are pinned to UTC midnight so day arithmetic never meets a DST shift. */
function toUtcMidnight(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function toIsoDate(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

interface CalendarCell extends CalendarHeatmapDay {
  /** A day outside the requested range, there only to complete a week column. */
  isPadding: boolean;
}

function buildCells(
  days: CalendarHeatmapDay[],
  weekStart: WeekStartDay
): CalendarCell[] {
  if (days.length === 0) {
    return [];
  }

  const valueByDate = new Map(days.map((day) => [day.date, day.value]));
  const timestamps = days.map((day) => toUtcMidnight(day.date));
  const firstDay = Math.min(...timestamps);
  const lastDay = Math.max(...timestamps);
  const gridStart = firstDay - weekdayOffset(firstDay, weekStart) * dayMs;
  const gridEnd =
    lastDay + (daysPerWeek - 1 - weekdayOffset(lastDay, weekStart)) * dayMs;

  const dayCount = (gridEnd - gridStart) / dayMs + 1;
  return Array.from({ length: dayCount }, (_, index) => {
    const timestamp = gridStart + index * dayMs;
    const date = toIsoDate(timestamp);
    return {
      date,
      value: valueByDate.get(date) ?? null,
      isPadding: timestamp < firstDay || timestamp > lastDay,
    };
  });
}

export function CalendarHeatmap({
  label,
  days,
  color = ChartColor.CHART_1,
  max,
  valueFormatter = defaultValueFormatter,
  weekdayLabels,
  locale,
  weekStartsOn,
  showMonthLabels = true,
  emptyLabel = 'No data',
  minimumCellSize = defaultCellSize,
  maximumCellSize = defaultCellSize,
  scaleLabels,
  className,
}: CalendarHeatmapProps) {
  const descriptionId = useId();
  const weekStart = resolveWeekStart({ locale, weekStartsOn });
  const cells = buildCells(days, weekStart);
  const weeks = Array.from({ length: cells.length / daysPerWeek }, (_, index) =>
    cells.slice(index * daysPerWeek, (index + 1) * daysPerWeek)
  );
  const weekdayNames =
    weekdayLabels ??
    (locale === undefined ? undefined : localeWeekdayNames(locale, weekStart));
  // Measured at the narrowest column, so labels stay apart however wide cells grow.
  const monthLabels = showMonthLabels
    ? calendarMonthLabels({
        dates: cells.map((cell) => cell.date),
        columnWidth: minimumCellSize + cellGap,
        locale,
      })
    : [];
  const monthLabelByColumn = new Map(
    monthLabels.map((monthLabel) => [monthLabel.columnIndex, monthLabel.text])
  );

  const measuredValues = days
    .map((day) => day.value)
    .filter((value): value is number => value !== null);
  const scaleMax =
    max ?? (measuredValues.length > 0 ? Math.max(...measuredValues) : 0);
  // Only days the caller asked about: the cells padding the first and last week
  // out to whole weeks are layout, not measurements that went missing.
  const missingDays = cells.filter(
    (cell) => !cell.isPadding && cell.value === null
  ).length;

  return (
    // `max-w-full` caps the shrink-to-fit width, which otherwise floors at the
    // grid's min-content and overflows a narrow card instead of scrolling.
    <div
      data-slot="calendar-heatmap"
      className={cn('inline-flex max-w-full flex-col gap-2', className)}
    >
      <div className="flex gap-0.5">
        {weekdayNames !== undefined && (
          // The labels sit beside the scroll port, so scrolled cells are clipped
          // by it rather than passing under them; nothing has to mask them.
          // `1fr` rows stretch to the grid's height and land on its rows.
          <div
            aria-hidden
            className="grid gap-0.5 text-caption leading-3 text-base-black/80"
            style={{
              gridTemplateRows: `${showMonthLabels ? `${headerRowHeight}px ` : ''}repeat(${daysPerWeek}, minmax(0, 1fr))`,
            }}
          >
            {showMonthLabels && <span />}
            {weekdayNames.map((weekdayName, index) => (
              <span
                key={weekdayName}
                data-slot="calendar-heatmap-weekday-label"
                className="flex items-center justify-end pr-1"
              >
                {labelledWeekdayRows.includes(index) ? weekdayName : ''}
              </span>
            ))}
          </div>
        )}
        {/* The image role sits inside the scroll port, not around it: the port is
            the element a keyboard focuses (WCAG 2.1.1), and an `img` subtree is
            presentational, so a focusable descendant of it would be unreachable. */}
        <ScrollArea
          className="min-w-0"
          data-slot="calendar-heatmap-scroll"
          scrollbar={<ScrollArea.ScrollBar orientation="horizontal" />}
        >
          {/* `justify-start` keeps spare width on the trailing side. */}
          <div
            role="img"
            aria-label={label}
            aria-describedby={missingDays > 0 ? descriptionId : undefined}
            data-slot="calendar-heatmap-grid"
            className="grid justify-start gap-0.5 text-caption leading-3 text-base-black/80"
            style={{
              gridAutoFlow: 'column',
              gridTemplateRows: `${showMonthLabels ? `${headerRowHeight}px ` : ''}repeat(${daysPerWeek}, auto)`,
              gridAutoColumns: `minmax(${minimumCellSize}px, ${maximumCellSize}px)`,
            }}
          >
            {weeks.map((week, columnIndex) => (
              <Fragment key={week[0].date}>
                {showMonthLabels && (
                  <span className="whitespace-nowrap">
                    {monthLabelByColumn.get(columnIndex) ?? ''}
                  </span>
                )}
                {week.map((cell) => {
                  // A day outside the range holds its place and shows nothing,
                  // so the hatch means "a day in the range without data".
                  if (cell.isPadding) {
                    return (
                      <span
                        key={cell.date}
                        data-slot="calendar-heatmap-cell"
                        data-padding
                        className="aspect-square"
                      />
                    );
                  }
                  if (cell.value === null) {
                    return (
                      <span
                        key={cell.date}
                        data-slot="calendar-heatmap-cell"
                        data-empty
                        title={`${cell.date}: ${emptyLabel}`}
                        className="aspect-square rounded-xs border border-base-light"
                        style={{
                          backgroundImage: heatmapEmptyCellBackgroundImage,
                        }}
                      />
                    );
                  }
                  return (
                    <span
                      key={cell.date}
                      data-slot="calendar-heatmap-cell"
                      title={`${cell.date}: ${valueFormatter(cell.value)}`}
                      className="aspect-square rounded-xs"
                      style={{
                        backgroundColor: heatmapCellColor(
                          heatmapLevel(cell.value, 0, scaleMax),
                          color
                        ),
                      }}
                    />
                  );
                })}
              </Fragment>
            ))}
          </div>
        </ScrollArea>
      </div>
      {/* The grid is an `img`, so its subtree is presentational and a cell's
          `title` never reaches assistive technology. This says how much is
          missing, in the caller's own words, outside that subtree. */}
      {missingDays > 0 && (
        <span id={descriptionId} className="sr-only">
          {`${emptyLabel}: ${missingDays}`}
        </span>
      )}
      {scaleLabels && (
        <HeatmapScaleLegend
          color={color}
          labels={scaleLabels}
          emptyLabel={missingDays > 0 ? emptyLabel : undefined}
        />
      )}
    </div>
  );
}
