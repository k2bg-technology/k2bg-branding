export const fallbackLng = 'ja';
export const languages = [fallbackLng, 'en'] as const;
export const defaultNS = 'translation';
export const cookieName = 'i18next';

export type Language = (typeof languages)[number];

/**
 * Validates the language parameter and returns a valid Language.
 * Falls back to fallbackLng if the provided language is not supported.
 */
export function resolveLanguage(lng: string): Language {
  return (languages as readonly string[]).includes(lng)
    ? (lng as Language)
    : fallbackLng;
}

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: true,
    supportedLngs: languages,
    // preload: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
    // backend: {
    //   projectId: ''
    // }
  };
}
