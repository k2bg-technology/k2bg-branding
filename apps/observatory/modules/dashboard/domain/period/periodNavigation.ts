import { type DateBounds, Period } from './period';

export interface PeriodNavigationTargets {
  previousTarget: Period | null;
  nextTarget: Period | null;
}

export function periodNavigation(
  period: Period,
  bounds: DateBounds
): PeriodNavigationTargets {
  const first = Period.fromCalendarDate(bounds.firstDate);
  const last = Period.fromCalendarDate(bounds.lastDate);
  if (first === null || last === null) {
    throw new Error('Invalid dashboard period bounds');
  }
  const previousTarget = previousTargetFor(period, first, last);
  const nextTarget = nextTargetFor(period, first, last);
  return { previousTarget, nextTarget };
}

function previousTargetFor(
  period: Period,
  first: Period,
  last: Period
): Period | null {
  if (period.toString() <= first.toString()) {
    return null;
  }
  const previous = period.shift(-1);
  return previous.toString() > last.toString() ? last : previous;
}

function nextTargetFor(
  period: Period,
  first: Period,
  last: Period
): Period | null {
  if (period.toString() >= last.toString()) {
    return null;
  }
  const next = period.shift(1);
  return next.toString() < first.toString() ? first : next;
}
