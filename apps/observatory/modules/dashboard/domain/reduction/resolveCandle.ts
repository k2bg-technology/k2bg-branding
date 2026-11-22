import { DuplicateCandleTimeError } from '../errors';
import { resolveEarliest } from './resolveEarliest';
import { resolveLatest } from './resolveLatest';

type CandleValues = [
  open: number | null,
  high: number | null,
  low: number | null,
  close: number | null,
];

interface CandleReduction {
  values: CandleValues;
  openDistinctCount: number;
  closeDistinctCount: number;
  incompleteRowCount: number;
  timeCount: number;
  rowCount: number;
}

interface CandleContext {
  sectionId: string;
  period: string;
  openColumn: string;
  closeColumn: string;
}

export function resolveCandle(
  reduction: CandleReduction,
  { sectionId, period, openColumn, closeColumn }: CandleContext
): CandleValues {
  if (reduction.rowCount > reduction.timeCount) {
    throw new DuplicateCandleTimeError(sectionId, period);
  }

  const [openingValue, high, low, closingValue] = reduction.values;
  const open = resolveEarliest(openingValue, reduction.openDistinctCount, {
    sectionId,
    column: openColumn,
  });
  const close = resolveLatest(closingValue, reduction.closeDistinctCount, {
    sectionId,
    column: closeColumn,
  });
  if (close === null || reduction.incompleteRowCount > 0) {
    return [null, null, null, close];
  }
  return [open, high, low, close];
}
