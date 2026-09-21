import { describe, expect, it } from 'vitest';

import { AmbiguousLatestValueError } from '../errors';
import { resolveLatest } from './resolveLatest';

describe('resolveLatest', () => {
  it('keeps a null latest value when it is the only distinct value', () => {
    const result = resolveLatest(null, 1, {
      sectionId: 'headline',
      column: 'value',
    });

    expect(result).toBeNull();
  });

  it('rejects a null and a value sharing the latest time as ambiguous', () => {
    const act = () =>
      resolveLatest(null, 2, {
        sectionId: 'headline',
        column: 'value',
      });

    expect(act).toThrow(AmbiguousLatestValueError);
  });
});
