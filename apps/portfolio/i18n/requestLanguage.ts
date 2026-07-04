import { cookies, headers } from 'next/headers';

import {
  cookieName,
  fallbackLanguage,
  type Language,
  languages,
  resolveLanguage,
} from './settings';

export async function getRequestLanguage(): Promise<Language> {
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
