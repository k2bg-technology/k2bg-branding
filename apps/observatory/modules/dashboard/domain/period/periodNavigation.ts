import { type DateBounds, Period } from './period';

export interface PeriodNavigationTargets {
  previousTarget: Period | null;
  nextTarget: Period | null;
}

export function periodNavigation(
  period: Period,
  bounds: DateBounds
): PeriodNavigationTargets {
  const first = Period.containing(period.grain, bounds.firstDate);
  const last = Period.containing(period.grain, bounds.lastDate);
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
  if (period.firstDate <= first.firstDate) {
    return null;
  }
  const previous = period.shift(-1);
  return previous.firstDate > last.firstDate ? last : previous;
}

function nextTargetFor(
  period: Period,
  first: Period,
  last: Period
): Period | null {
  if (period.firstDate >= last.firstDate) {
    return null;
  }
  const next = period.shift(1);
  return next.firstDate < first.firstDate ? first : next;
}
