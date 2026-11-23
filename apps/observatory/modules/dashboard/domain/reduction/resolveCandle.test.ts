import { describe, expect, it } from 'vitest';

import { DuplicateCandleTimeError } from '../errors';
import { resolveCandle } from './resolveCandle';

type CandleReduction = Parameters<typeof resolveCandle>[0];

function reduction(overrides: Partial<CandleReduction> = {}): CandleReduction {
  return {
    values: [10, 31, 7, 23],
    openDistinctCount: 1,
    closeDistinctCount: 1,
    incompleteRowCount: 0,
    timeCount: 3,
    rowCount: 3,
    ...overrides,
  };
}

describe('resolveCandle', () => {
  const context = {
    sectionId: 'candles',
    period: '2026-08',
    openColumn: 'opening_value',
    closeColumn: 'closing_value',
  };

  it('keeps the four reduced values when every source row is complete', () => {
    const input = reduction();
    const sut = resolveCandle;

    const result = sut(input, context);

    expect(result).toEqual([10, 31, 7, 23]);
  });

  it('keeps only the final close when the bucket contains an incomplete row', () => {
    const input = reduction({ incompleteRowCount: 1 });
    const sut = resolveCandle;

    const result = sut(input, context);

    expect(result).toEqual([null, null, null, 23]);
  });

  it('leaves the bucket unmarked when the final close is null', () => {
    const input = reduction({
      values: [10, 31, 7, null],
      incompleteRowCount: 1,
    });
    const sut = resolveCandle;

    const result = sut(input, context);

    expect(result).toEqual([null, null, null, null]);
  });

  it('rejects a duplicate source time even when the projected open is ambiguous', () => {
    const input = reduction({ timeCount: 2, openDistinctCount: 2 });
    const sut = resolveCandle;

    const act = () => sut(input, context);

    expect(act).toThrow(DuplicateCandleTimeError);
  });
});
