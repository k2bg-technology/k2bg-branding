import { cookies, headers } from 'next/headers';
import { lang } from 'next/root-params';
import { describe, expect, it, vi } from 'vitest';

import { getRequestLanguage } from './requestLanguage';
import { cookieName, fallbackLanguage } from './settings';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}));

vi.mock('next/root-params', () => ({
  lang: vi.fn(),
}));

type HeaderStore = Awaited<ReturnType<typeof headers>>;
type CookieStore = Awaited<ReturnType<typeof cookies>>;

function createHeaderStore(entries: Record<string, string>): HeaderStore {
  const normalizedEntries = new Map(
    Object.entries(entries).map(([name, value]) => [name.toLowerCase(), value])
  );

  return {
    get: (name: string) => normalizedEntries.get(name.toLowerCase()) ?? null,
  } as HeaderStore;
}

function createCookieStore(cookieLanguage?: string): CookieStore {
  // Only `get(name)` is exercised by getRequestLanguage; the remaining
  // ReadonlyRequestCookies members are irrelevant to these tests.
  return {
    get: (name: string) =>
      cookieLanguage !== undefined && name === cookieName
        ? { name, value: cookieLanguage }
        : undefined,
  } as unknown as CookieStore;
}

// An empty root param stands for "no usable [lang] segment": `lang()` always
// resolves to a string, so unsupported values are how it fails to be helpful.
const unsupportedRootParamLanguage = '';

function stubRequestSources({
  rootParamLanguage = unsupportedRootParamLanguage,
  cookieLanguage,
  acceptLanguage,
}: {
  rootParamLanguage?: string;
  cookieLanguage?: string;
  acceptLanguage?: string;
} = {}) {
  vi.mocked(lang).mockResolvedValue(rootParamLanguage);
  vi.mocked(headers).mockResolvedValue(
    createHeaderStore({
      ...(acceptLanguage !== undefined && {
        'accept-language': acceptLanguage,
      }),
    })
  );
  vi.mocked(cookies).mockResolvedValue(createCookieStore(cookieLanguage));
}

describe('getRequestLanguage', () => {
  it.each([{ rootParamLanguage: 'en' }, { rootParamLanguage: 'ja' }])(
    'returns "$rootParamLanguage" from the [lang] root param',
    async ({ rootParamLanguage }) => {
      stubRequestSources({ rootParamLanguage });

      const language = await getRequestLanguage();

      expect(language).toBe(rootParamLanguage);
    }
  );

  it('returns the language from the locale cookie when the root param is not a supported language', async () => {
    stubRequestSources({ cookieLanguage: 'en' });

    const language = await getRequestLanguage();

    expect(language).toBe('en');
  });

  it('returns the fallback language when no source provides a language', async () => {
    stubRequestSources();

    const language = await getRequestLanguage();

    expect(language).toBe(fallbackLanguage);
  });

  describe('Accept-Language resolution', () => {
    it.each([
      { acceptLanguage: 'en;q=0.8,ja;q=0.9', expected: 'ja' },
      { acceptLanguage: 'ja;q=0.8,en;q=0.9', expected: 'en' },
      { acceptLanguage: 'fr;q=0.9,en;q=0.5', expected: 'en' },
      { acceptLanguage: 'en-US,ja;q=0.5', expected: 'en' },
      { acceptLanguage: 'fr,de;q=0.9', expected: fallbackLanguage },
    ])(
      'returns "$expected" for Accept-Language "$acceptLanguage"',
      async ({ acceptLanguage, expected }) => {
        stubRequestSources({ acceptLanguage });

        const language = await getRequestLanguage();

        expect(language).toBe(expected);
      }
    );
  });

  describe('when sources conflict', () => {
    it.each([
      {
        scenario:
          'prefers the "en" root param over the cookie and Accept-Language',
        rootParamLanguage: 'en',
        cookieLanguage: 'ja',
        acceptLanguage: 'ja',
        expected: 'en',
      },
      {
        scenario:
          'prefers the "ja" root param over the cookie and Accept-Language',
        rootParamLanguage: 'ja',
        cookieLanguage: 'en',
        acceptLanguage: 'en',
        expected: 'ja',
      },
      {
        scenario:
          'prefers the cookie over Accept-Language when the root param is unsupported',
        rootParamLanguage: unsupportedRootParamLanguage,
        cookieLanguage: 'ja',
        acceptLanguage: 'en',
        expected: 'ja',
      },
      {
        scenario: 'ignores an unsupported cookie and uses Accept-Language',
        rootParamLanguage: unsupportedRootParamLanguage,
        cookieLanguage: 'fr',
        acceptLanguage: 'en',
        expected: 'en',
      },
    ])(
      '$scenario',
      async ({
        rootParamLanguage,
        cookieLanguage,
        acceptLanguage,
        expected,
      }) => {
        stubRequestSources({
          rootParamLanguage,
          cookieLanguage,
          acceptLanguage,
        });

        const language = await getRequestLanguage();

        expect(language).toBe(expected);
      }
    );
  });

  describe('when the root param is not a supported language', () => {
    it.each([
      {
        scenario: 'falls back to the cookie',
        rootParamLanguage: 'foo.bar',
        cookieLanguage: 'en',
        acceptLanguage: 'ja',
        expected: 'en',
      },
      {
        scenario: 'falls back to Accept-Language when no cookie is present',
        rootParamLanguage: 'foo.bar',
        cookieLanguage: undefined,
        acceptLanguage: 'en',
        expected: 'en',
      },
      {
        scenario:
          'falls back to the fallback language when no other source matches',
        rootParamLanguage: unsupportedRootParamLanguage,
        cookieLanguage: undefined,
        acceptLanguage: undefined,
        expected: fallbackLanguage,
      },
    ])(
      '$scenario for the root param "$rootParamLanguage"',
      async ({
        rootParamLanguage,
        cookieLanguage,
        acceptLanguage,
        expected,
      }) => {
        stubRequestSources({
          rootParamLanguage,
          cookieLanguage,
          acceptLanguage,
        });

        const language = await getRequestLanguage();

        expect(language).toBe(expected);
      }
    );
  });
});
