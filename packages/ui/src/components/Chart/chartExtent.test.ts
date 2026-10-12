import { describe, expect, it } from 'vitest';

import { numericExtent } from './chartExtent';

describe('numericExtent', () => {
  it('returns the smallest and largest value in any order', () => {
    const result = numericExtent([3, -7, 12, 0]);

    expect(result).toEqual({ minimum: -7, maximum: 12 });
  });

  it('returns the extent of more values than a call can take as arguments', () => {
    const values = Array.from({ length: 500_000 }, (_, index) => index);

    const result = numericExtent(values);

    expect(result).toEqual({ minimum: 0, maximum: 499_999 });
  });

  it('returns undefined without values', () => {
    const result = numericExtent([]);

    expect(result).toBeUndefined();
  });
});
