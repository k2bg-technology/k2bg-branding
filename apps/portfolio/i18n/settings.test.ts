import { describe, expect, it } from 'vitest';

import { fallbackLanguage, resolveLanguage } from './settings';

describe('resolveLanguage', () => {
  it.each(['ja', 'en'] as const)(
    'returns the language unchanged when given the supported language "%s"',
    (language) => {
      const result = resolveLanguage(language);

      expect(result).toBe(language);
    }
  );

  it.each(['fr', 'zh', ''])(
    'falls back to the fallback language when given the unsupported language "%s"',
    (language) => {
      const result = resolveLanguage(language);

      expect(result).toBe(fallbackLanguage);
    }
  );
});
