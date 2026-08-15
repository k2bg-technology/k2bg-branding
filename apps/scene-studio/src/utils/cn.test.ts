import { describe, expect, it } from 'vitest';

import { cn } from './cn';

describe('cn', () => {
  it.each([
    {
      description: 'keeps only the last scene font-size class',
      input: ['text-scene-title', 'text-scene-caption'],
      expected: 'text-scene-caption',
    },
    {
      description: 'keeps a text color next to a scene font-size class',
      input: ['text-scene-title', 'text-base-white'],
      expected: 'text-scene-title text-base-white',
    },
    {
      description: 'merges conflicting display classes',
      input: ['block', 'flex'],
      expected: 'flex',
    },
  ])('$description', ({ input, expected }) => {
    const result = cn(...input);

    expect(result).toBe(expected);
  });

  it('ignores falsy inputs from conditional classes', () => {
    const result = cn('absolute', false, undefined, 'bottom-0');

    expect(result).toBe('absolute bottom-0');
  });
});
