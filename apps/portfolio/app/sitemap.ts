import type { MetadataRoute } from 'next';

import { languages } from '../i18n/settings';

import { getLocalizedUrl } from './site';

export default function sitemap(): MetadataRoute.Sitemap {
  const alternates = Object.fromEntries(
    languages.map((language) => [language, getLocalizedUrl(language)])
  );

  return languages.map((language) => ({
    url: getLocalizedUrl(language),
    alternates: {
      languages: alternates,
    },
  }));
}
