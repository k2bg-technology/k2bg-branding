import { describe, expect, it, vi } from 'vitest';

import en from './locales/en/translation.json';
import ja from './locales/ja/translation.json';
import { getDictionary } from './dictionaries';

// The `server-only` package throws when imported outside a Next.js server
// build; dictionaries.ts imports it as a guard. Stub it so the module can be
// loaded directly under Vitest.
vi.mock('server-only', () => ({}));

function collectKeyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, nested]) =>
    collectKeyPaths(nested, prefix ? `${prefix}.${key}` : key)
  );
}

describe('getDictionary', () => {
  it('loads the Japanese dictionary', async () => {
    const dictionary = await getDictionary('ja');

    expect(dictionary.hero.corporateName).toBe(ja.hero.corporateName);
  });

  it('loads the English dictionary', async () => {
    const dictionary = await getDictionary('en');

    expect(dictionary.hero.corporateName).toBe(en.hero.corporateName);
  });
});

describe('locale translation files', () => {
  it('have identical key structure between ja and en', () => {
    const jaKeyPaths = collectKeyPaths(ja).sort();
    const enKeyPaths = collectKeyPaths(en).sort();

    expect(jaKeyPaths).toEqual(enKeyPaths);
  });
});
