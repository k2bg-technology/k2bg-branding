import { describe, expect, it } from 'vitest';

import { AmbiguousEarliestValueError } from '../errors';
import { resolveEarliest } from './resolveEarliest';

describe('resolveEarliest', () => {
  const context = { sectionId: 'candles', column: 'opening_value' };

  it.each([{ value: 72 }, { value: null }])(
    'preserves $value when the earliest value is unambiguous',
    ({ value }) => {
      const sut = resolveEarliest;

      const result = sut(value, 1, context);

      expect(result).toBe(value);
    }
  );

  it('rejects conflicting values at the earliest source time', () => {
    const sut = resolveEarliest;

    const act = () => sut(72, 2, context);

    expect(act).toThrow(AmbiguousEarliestValueError);
  });
});
