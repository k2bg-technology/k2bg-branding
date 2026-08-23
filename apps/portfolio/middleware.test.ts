import { tryToParsePath } from 'next/dist/lib/try-to-parse-path';
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { cookieName } from './i18n/settings';
import { config, middleware } from './middleware';

const prefetchHeaderVariants: Record<string, string>[] = [
  { 'Next-Router-Prefetch': '1' },
  { Purpose: 'prefetch' },
];

// `NextResponse.next({ request: { headers } })` encodes forwarded request
// headers on the response as `x-middleware-request-<name>`; Next.js replays
// them onto the request that reaches server components such as not-found.tsx.
function getForwardedLocale(
  response: ReturnType<typeof middleware>
): string | null {
  return response.headers.get('x-middleware-request-x-locale');
}

// Compiles config.matcher the same way the Next.js build does, so the tests
// exercise the exclusions the framework actually applies.
function matchesMiddlewareMatcher(pathname: string): boolean {
  return config.matcher.some((matcherPattern) => {
    const { regexStr } = tryToParsePath(matcherPattern);
    return regexStr !== undefined && new RegExp(regexStr).test(pathname);
  });
}

describe('middleware', () => {
  describe('when the request path has no locale prefix', () => {
    it('redirects using the locale from the NEXT_LOCALE cookie', () => {
      const request = new NextRequest(new URL('http://localhost/about'), {
        headers: { cookie: `${cookieName}=en` },
      });

      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost/en/about'
      );
    });

    it('redirects using the highest-quality supported language from Accept-Language when no cookie is present', () => {
      const request = new NextRequest(new URL('http://localhost/about'), {
        headers: { 'Accept-Language': 'fr;q=0.9,en;q=0.5' },
      });

      const response = middleware(request);

      expect(response.headers.get('location')).toBe(
        'http://localhost/en/about'
      );
    });

    it('redirects using the fallback language when neither a cookie nor a matching Accept-Language is present', () => {
      const request = new NextRequest(new URL('http://localhost/about'));

      const response = middleware(request);

      expect(response.headers.get('location')).toBe(
        'http://localhost/ja/about'
      );
    });

    it('prefers the cookie locale over the Accept-Language header', () => {
      const request = new NextRequest(new URL('http://localhost/about'), {
        headers: {
          cookie: `${cookieName}=ja`,
          'Accept-Language': 'en;q=0.9',
        },
      });

      const response = middleware(request);

      expect(response.headers.get('location')).toBe(
        'http://localhost/ja/about'
      );
    });
  });

  describe('when the request path already has a locale prefix', () => {
    it('returns NextResponse.next() without redirecting', () => {
      const request = new NextRequest(new URL('http://localhost/en/about'));

      const response = middleware(request);

      expect(response.headers.get('location')).toBeNull();
    });

    it('writes the locale cookie for a normal navigation request', () => {
      const request = new NextRequest(new URL('http://localhost/en/about'));

      const response = middleware(request);

      expect(response.cookies.get(cookieName)?.value).toBe('en');
    });

    it.each(prefetchHeaderVariants)(
      'does not write the locale cookie for a prefetch request with headers %o',
      (headers) => {
        const request = new NextRequest(new URL('http://localhost/en/about'), {
          headers,
        });

        const response = middleware(request);

        expect(response.cookies.get(cookieName)).toBeUndefined();
      }
    );
  });

  describe('locale propagation to server components', () => {
    it.each([
      { pathname: '/ja/about', expectedLocale: 'ja' },
      { pathname: '/en/about', expectedLocale: 'en' },
      { pathname: '/ja', expectedLocale: 'ja' },
      { pathname: '/en', expectedLocale: 'en' },
    ])(
      'forwards "$expectedLocale" as the x-locale request header for $pathname',
      ({ pathname, expectedLocale }) => {
        const request = new NextRequest(new URL(`http://localhost${pathname}`));

        const response = middleware(request);

        expect(getForwardedLocale(response)).toBe(expectedLocale);
      }
    );

    it.each([
      { pathname: '/ja/about', cookieLocale: 'en', expectedLocale: 'ja' },
      { pathname: '/en/about', cookieLocale: 'ja', expectedLocale: 'en' },
    ])(
      'forwards the URL locale "$expectedLocale" for $pathname when the cookie says "$cookieLocale"',
      ({ pathname, cookieLocale, expectedLocale }) => {
        const request = new NextRequest(
          new URL(`http://localhost${pathname}`),
          { headers: { cookie: `${cookieName}=${cookieLocale}` } }
        );

        const response = middleware(request);

        expect(getForwardedLocale(response)).toBe(expectedLocale);
      }
    );

    it('forwards the URL locale when Accept-Language prefers another language', () => {
      const request = new NextRequest(new URL('http://localhost/ja/about'), {
        headers: { 'Accept-Language': 'en;q=0.9' },
      });

      const response = middleware(request);

      expect(getForwardedLocale(response)).toBe('ja');
    });

    it.each(prefetchHeaderVariants)(
      'forwards the URL locale for a prefetch request with headers %o even though the cookie is left untouched',
      (headers) => {
        const request = new NextRequest(new URL('http://localhost/en/about'), {
          headers,
        });

        const response = middleware(request);

        expect(getForwardedLocale(response)).toBe('en');
      }
    );

    it('does not forward an x-locale header when the request is redirected to a localized path', () => {
      const request = new NextRequest(new URL('http://localhost/about'), {
        headers: { cookie: `${cookieName}=en` },
      });

      const response = middleware(request);

      expect(getForwardedLocale(response)).toBeNull();
    });

    it.each(['/icon.png', '/chrome-devtools.json'])(
      'does not forward an x-locale header for the bypassed path %s',
      (pathname) => {
        const request = new NextRequest(new URL(`http://localhost${pathname}`));

        const response = middleware(request);

        expect(getForwardedLocale(response)).toBeNull();
      }
    );
  });

  describe('config matcher', () => {
    it.each(['/robots.txt', '/sitemap.xml'])(
      'excludes %s from locale handling',
      (pathname) => {
        const isMatched = matchesMiddlewareMatcher(pathname);

        expect(isMatched).toBe(false);
      }
    );

    it.each(['/manifest.webmanifest', '/og/hero.png', '/en/logo.svg'])(
      'excludes the static-like dotted path %s from locale handling',
      (pathname) => {
        const isMatched = matchesMiddlewareMatcher(pathname);

        expect(isMatched).toBe(false);
      }
    );

    it.each(['/', '/about', '/en/about'])(
      'includes the page path %s in locale handling',
      (pathname) => {
        const isMatched = matchesMiddlewareMatcher(pathname);

        expect(isMatched).toBe(true);
      }
    );
  });

  describe('when the path contains "icon" or "chrome"', () => {
    it.each(['/icon.png', '/apple-touch-icon.png', '/chrome-devtools.json'])(
      'returns NextResponse.next() without redirecting for %s',
      (pathname) => {
        const request = new NextRequest(new URL(`http://localhost${pathname}`));

        const response = middleware(request);

        expect(response.headers.get('location')).toBeNull();
      }
    );
  });
});
