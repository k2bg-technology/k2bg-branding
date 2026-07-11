import { cookies, headers } from 'next/headers';
import { describe, expect, it, vi } from 'vitest';

import { getRequestLanguage } from './requestLanguage';
import { cookieName, fallbackLanguage } from './settings';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
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

function stubRequestSources({
  urlLanguage,
  cookieLanguage,
  acceptLanguage,
}: {
  urlLanguage?: string;
  cookieLanguage?: string;
  acceptLanguage?: string;
} = {}) {
  vi.mocked(headers).mockResolvedValue(
    createHeaderStore({
      ...(urlLanguage !== undefined && { 'x-locale': urlLanguage }),
      ...(acceptLanguage !== undefined && {
        'accept-language': acceptLanguage,
      }),
    })
  );
  vi.mocked(cookies).mockResolvedValue(createCookieStore(cookieLanguage));
}

describe('getRequestLanguage', () => {
  it('returns the language from the x-locale header set by the middleware', async () => {
    stubRequestSources({ urlLanguage: 'en' });

    const language = await getRequestLanguage();

    expect(language).toBe('en');
  });

  it('returns the language from the locale cookie when no x-locale header is present', async () => {
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
        scenario: 'prefers the x-locale header over the cookie and Accept-Language',
        urlLanguage: 'en',
        cookieLanguage: 'ja',
        acceptLanguage: 'ja',
        expected: 'en',
      },
      {
        scenario: 'prefers the cookie over Accept-Language when no x-locale header is present',
        urlLanguage: undefined,
        cookieLanguage: 'ja',
        acceptLanguage: 'en',
        expected: 'ja',
      },
      {
        scenario: 'ignores an unsupported x-locale header and uses the cookie',
        urlLanguage: 'fr',
        cookieLanguage: 'en',
        acceptLanguage: 'ja',
        expected: 'en',
      },
      {
        scenario: 'ignores an unsupported cookie and uses Accept-Language',
        urlLanguage: undefined,
        cookieLanguage: 'fr',
        acceptLanguage: 'en',
        expected: 'en',
      },
    ])('$scenario', async ({ urlLanguage, cookieLanguage, acceptLanguage, expected }) => {
      stubRequestSources({ urlLanguage, cookieLanguage, acceptLanguage });

      const language = await getRequestLanguage();

      expect(language).toBe(expected);
    });
  });
});
