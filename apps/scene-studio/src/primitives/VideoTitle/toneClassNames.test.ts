import { describe, expect, it } from 'vitest';

import { TONE_CLASS_NAMES } from './VideoTitle';

describe('TONE_CLASS_NAMES', () => {
  it.each([
    { tone: 'main', expected: 'text-main-default' },
    { tone: 'accent', expected: 'text-accent-default' },
    { tone: 'white', expected: 'text-base-white' },
  ] as const)(
    'maps $tone to the $expected token class',
    ({ tone, expected }) => {
      expect(TONE_CLASS_NAMES[tone]).toBe(expected);
    }
  );
});
