export const fallbackLanguage = 'ja';
export const languages = [fallbackLanguage, 'en'] as const;
export const cookieName = 'NEXT_LOCALE';

export type Language = (typeof languages)[number];

/**
 * Validates the language parameter and returns a valid Language.
 * Falls back to fallbackLanguage if the provided language is not supported.
 */
export function resolveLanguage(language: string): Language {
  return (languages as readonly string[]).includes(language)
    ? (language as Language)
    : fallbackLanguage;
}
