import { describe, expect, it } from 'vitest';

import { twMerge } from './extendTailwindMerge';

describe('typography class merging', () => {
  it.each([
    ['text-heading-1 text-heading-2', 'text-heading-2'],
    ['text-body-r-md text-button-b-sm', 'text-button-b-sm'],
    ['text-caption text-subtitle-lg text-body-b-lg', 'text-body-b-lg'],
  ])('keeps the final typography token for "%s"', (className, expected) => {
    const sut = twMerge(className);

    expect(sut).toBe(expected);
  });

  it('keeps non-typography text utilities alongside typography tokens', () => {
    const sut = twMerge('text-main-default text-heading-1 text-heading-2');

    expect(sut).toBe('text-main-default text-heading-2');
  });
});
