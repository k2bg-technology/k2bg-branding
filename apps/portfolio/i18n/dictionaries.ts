import 'server-only'

import type { Language } from './settings';
import type { Dictionary } from './types';

export type { Dictionary };

const dictionaries: Record<Language, () => Promise<Dictionary>> = {
  ja: () =>
    import('./locales/ja/translation.json').then((module) => module.default),
  en: () =>
    import('./locales/en/translation.json').then((module) => module.default),
};

export async function getDictionary(locale: Language): Promise<Dictionary> {
  return dictionaries[locale]();
}
