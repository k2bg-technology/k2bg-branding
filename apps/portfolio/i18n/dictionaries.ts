import 'server-only';

import type en from './locales/en/translation.json';
import type { Language } from './settings';

export type Dictionary = typeof en;

const dictionaries: Record<Language, () => Promise<Dictionary>> = {
  ja: () =>
    import('./locales/ja/translation.json').then((module) => module.default),
  en: () =>
    import('./locales/en/translation.json').then((module) => module.default),
};

export async function getDictionary(locale: Language): Promise<Dictionary> {
  return dictionaries[locale]();
}
