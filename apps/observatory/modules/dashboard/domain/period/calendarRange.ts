import { DomainError } from '../errors';
import { addDays } from './calendarDate';
import type { DateBounds, Period } from './period';

export type CalendarRange = 'trailing' | 'calendar-year';

interface CalendarRangeInput {
  range: CalendarRange;
  window?: number;
}

export function resolveCalendarRange(
  section: CalendarRangeInput,
  selectedPeriod: Period
): DateBounds {
  const { lastDate } = selectedPeriod;
  if (section.range === 'calendar-year') {
    const year = lastDate.slice(0, 4);
    return { firstDate: `${year}-01-01`, lastDate: `${year}-12-31` };
  }
  if (section.window === undefined) {
    throw new DomainError('A trailing calendar heatmap requires window');
  }
  return { firstDate: addDays(lastDate, 1 - section.window), lastDate };
}
