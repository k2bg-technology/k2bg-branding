export const fallbackLng = 'ja';
export const languages = [fallbackLng, 'en'] as const;
export const defaultNS = 'translation';
export const cookieName = 'i18next';

export type Language = (typeof languages)[number];

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
