import { describe, expect, it } from 'vitest';
import { escapeLike } from './escapeLike';

describe('drizzle/escapeLike', () => {
  it('returns the value unchanged when it contains no wildcards', () => {
    const result = escapeLike('hello world');

    expect(result).toBe('hello world');
  });

  it('returns an empty string for an empty input', () => {
    const result = escapeLike('');

    expect(result).toBe('');
  });

  it.each([
    { input: '%foo%', expected: '\\%foo\\%' },
    { input: '100_pct', expected: '100\\_pct' },
    { input: 'back\\slash', expected: 'back\\\\slash' },
    { input: '50%_off\\foo', expected: '50\\%\\_off\\\\foo' },
  ])('escapes %, _ and backslash in $input', ({ input, expected }) => {
    const result = escapeLike(input);

    expect(result).toBe(expected);
  });
});
