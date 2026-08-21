import { tryToParsePath } from 'next/dist/lib/try-to-parse-path';
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { cookieName } from './i18n/settings';
import { config, middleware } from './middleware';

const prefetchHeaderVariants: Record<string, string>[] = [
  { 'Next-Router-Prefetch': '1' },
  { Purpose: 'prefetch' },
];

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

  describe('config matcher', () => {
    it.each([
      '/robots.txt',
      '/sitemap.xml',
    ])('excludes %s from locale handling', (pathname) => {
      const isMatched = matchesMiddlewareMatcher(pathname);

      expect(isMatched).toBe(false);
    });

    it.each([
      '/',
      '/about',
      '/en/about',
    ])('includes the page path %s in locale handling', (pathname) => {
      const isMatched = matchesMiddlewareMatcher(pathname);

      expect(isMatched).toBe(true);
    });
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
