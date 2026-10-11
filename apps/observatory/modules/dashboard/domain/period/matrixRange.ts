import { resolveCalendarRange } from './calendarRange';
import type { DateBounds, Period } from './period';

export function resolveMatrixRange(
  section: { window?: number },
  selectedPeriod: Period
): DateBounds {
  if (section.window === undefined) {
    return {
      firstDate: selectedPeriod.firstDate,
      lastDate: selectedPeriod.lastDate,
    };
  }
  return resolveCalendarRange(
    { range: 'trailing', window: section.window },
    selectedPeriod
  );
}
