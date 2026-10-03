import { describe, expect, it } from 'vitest';

import { clampUnit } from './clampUnit';

describe('clampUnit', () => {
  it.each([
    {
      description: 'clamps a negative value to zero',
      value: -0.5,
      expected: 0,
    },
    {
      description: 'passes an in-range value through',
      value: 0.4,
      expected: 0.4,
    },
    { description: 'clamps a value above one to one', value: 1.5, expected: 1 },
  ])('$description', ({ value, expected }) => {
    const result = clampUnit(value);

    expect(result).toBe(expected);
  });
});
