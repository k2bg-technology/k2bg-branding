import { describe, expect, it } from 'vitest';

import { getSeededRandom } from './seededRandom';

describe('getSeededRandom', () => {
  it.each([
    { description: 'an integer value', value: 3, seed: 0 },
    { description: 'a fractional value', value: 12.75, seed: 4 },
    { description: 'a negative value', value: -8, seed: 2 },
    { description: 'a large value', value: 9001, seed: 17 },
  ])('returns a result within [0, 1) for $description', ({ value, seed }) => {
    const result = getSeededRandom(value, seed);

    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(1);
  });

  it('returns identical results for identical inputs', () => {
    const first = getSeededRandom(42, 7);
    const second = getSeededRandom(42, 7);

    expect(second).toBe(first);
  });

  it('returns different results for different seeds', () => {
    const withDefaultSeed = getSeededRandom(42, 0);
    const withOtherSeed = getSeededRandom(42, 7);

    expect(withOtherSeed).not.toBe(withDefaultSeed);
  });
});
