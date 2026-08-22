import { type NextRequest, NextResponse } from 'next/server';

import { cookieName, fallbackLanguage, languages } from './i18n/settings';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|videos|assets|favicon.ico|sw.js|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
};

function getLocaleFromAcceptLanguage(request: NextRequest): string {
  const acceptLanguage = request.headers.get('Accept-Language');
  if (!acceptLanguage) return fallbackLanguage;

  const preferred = acceptLanguage
    .split(',')
    .map((part) => {
      const [language, quality] = part.trim().split(';q=');
      return {
        language: language.trim().split('-')[0],
        quality: quality ? Number(quality) : 1,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { language } of preferred) {
    if ((languages as readonly string[]).includes(language)) {
      return language;
    }
  }

  return fallbackLanguage;
}

function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get(cookieName)?.value;
  if (cookieLocale && (languages as readonly string[]).includes(cookieLocale)) {
    return cookieLocale;
  }

  return getLocaleFromAcceptLanguage(request);
}

export function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.includes('icon') ||
    request.nextUrl.pathname.includes('chrome')
  ) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const pathnameHasLocale = languages.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  const localeInPath = languages.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Propagate the URL's locale to server components (e.g. the not-found
  // boundary, which cannot receive route params) so the URL stays authoritative.
  const requestHeaders = new Headers(request.headers);
  if (localeInPath) {
    requestHeaders.set('x-locale', localeInPath);
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  const isPrefetch =
    request.headers.get('Next-Router-Prefetch') === '1' ||
    request.headers.get('Purpose') === 'prefetch';

  if (!isPrefetch && localeInPath) {
    response.cookies.set(cookieName, localeInPath);
  }

  return response;
}
