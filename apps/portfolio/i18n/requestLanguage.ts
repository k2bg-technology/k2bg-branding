import { cookies, headers } from 'next/headers';
import { lang } from 'next/root-params';

import {
  cookieName,
  fallbackLanguage,
  type Language,
  languages,
  resolveLanguage,
} from './settings';

/**
 * Resolves the request language for server components that cannot receive
 * route params, such as the not-found boundary.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/root-params
 */
export async function getRequestLanguage(): Promise<Language> {
  // `[lang]` is a root param, so it mirrors the URL even for requests the
  // middleware never sees; it is authoritative over the cookie.
  const languageFromUrl: string | undefined = await lang();
  if (languageFromUrl && isSupportedLanguage(languageFromUrl)) {
    return languageFromUrl;
  }

  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get(cookieName)?.value;

  if (cookieLanguage && isSupportedLanguage(cookieLanguage)) {
    return cookieLanguage;
  }

  const headerStore = await headers();

  return getLanguageFromAcceptLanguage(headerStore.get('Accept-Language'));
}

function getLanguageFromAcceptLanguage(acceptLanguage: string | null): Language {
  if (!acceptLanguage) {
    return fallbackLanguage;
  }

  const preferredLanguages = acceptLanguage
    .split(',')
    .map((part) => {
      const [language, quality] = part.trim().split(';q=');
      return {
        language: language.trim().split('-')[0],
        quality: quality ? Number(quality) : 1,
      };
    })
    .sort((first, second) => second.quality - first.quality);

  const preferredLanguage = preferredLanguages.find(({ language }) =>
    isSupportedLanguage(language)
  )?.language;

  return resolveLanguage(preferredLanguage ?? fallbackLanguage);
}

function isSupportedLanguage(language: string): language is Language {
  return (languages as readonly string[]).includes(language);
}
