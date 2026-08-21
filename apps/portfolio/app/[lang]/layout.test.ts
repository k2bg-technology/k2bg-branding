import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../../i18n/locales/en/translation.json';
import ja from '../../i18n/locales/ja/translation.json';

const configuredBaseUrl = 'https://portfolio.example.com';
const ogImageUrl = `${configuredBaseUrl}/images/hero-og.jpg`;
const supportedLanguages = ['ja', 'en'] as const;

// dictionaries.ts imports `server-only`, which throws outside a Next.js
// server build. Stub it so layout.tsx can be loaded directly under Vitest.
vi.mock('server-only', () => ({}));

// layout.tsx resolves the base URL at module scope via ../site, so each test
// re-imports the module after stubbing the environment.
async function generateMetadataFor(lang: string) {
  vi.resetModules();
  const { generateMetadata } = await import('./layout');

  return generateMetadata({
    children: null,
    params: Promise.resolve({ lang }),
  });
}

describe('generateMetadata', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sets metadataBase to the configured site base URL', async () => {
    vi.stubEnv('PORTFOLIO_SITE_BASE_URL', configuredBaseUrl);

    const metadata = await generateMetadataFor('ja');

    expect(String(metadata.metadataBase)).toBe(`${configuredBaseUrl}/`);
  });

  it.each(supportedLanguages)(
    'sets the canonical URL to the localized page URL for "%s"',
    async (language) => {
      vi.stubEnv('PORTFOLIO_SITE_BASE_URL', configuredBaseUrl);

      const metadata = await generateMetadataFor(language);

      expect(metadata.alternates?.canonical).toBe(
        `${configuredBaseUrl}/${language}`
      );
    }
  );

  it.each(supportedLanguages)(
    'lists hreflang alternates for every supported language on "%s"',
    async (language) => {
      vi.stubEnv('PORTFOLIO_SITE_BASE_URL', configuredBaseUrl);

      const metadata = await generateMetadataFor(language);

      expect(metadata.alternates?.languages).toEqual({
        ja: `${configuredBaseUrl}/ja`,
        en: `${configuredBaseUrl}/en`,
      });
    }
  );

  it.each([
    { language: 'ja', locale: 'ja_JP' },
    { language: 'en', locale: 'en_US' },
  ])(
    'sets the Open Graph URL and locale for "$language"',
    async ({ language, locale }) => {
      vi.stubEnv('PORTFOLIO_SITE_BASE_URL', configuredBaseUrl);

      const metadata = await generateMetadataFor(language);

      expect(metadata.openGraph).toMatchObject({
        url: `${configuredBaseUrl}/${language}`,
        locale,
      });
    }
  );

  it('uses the site base URL for Open Graph and Twitter images', async () => {
    vi.stubEnv('PORTFOLIO_SITE_BASE_URL', configuredBaseUrl);

    const metadata = await generateMetadataFor('ja');

    expect(metadata.openGraph).toMatchObject({ images: [{ url: ogImageUrl }] });
    expect(metadata.twitter).toMatchObject({ images: [{ url: ogImageUrl }] });
  });

  it.each([
    { language: 'ja', description: ja.metadata.description },
    { language: 'en', description: en.metadata.description },
  ])(
    'uses the localized description for "$language"',
    async ({ language, description }) => {
      vi.stubEnv('PORTFOLIO_SITE_BASE_URL', configuredBaseUrl);

      const metadata = await generateMetadataFor(language);

      expect(metadata.description).toBe(description);
    }
  );

  it('falls back to the default language when the lang param is unsupported', async () => {
    vi.stubEnv('PORTFOLIO_SITE_BASE_URL', configuredBaseUrl);

    const metadata = await generateMetadataFor('fr');

    expect(metadata.alternates?.canonical).toBe(`${configuredBaseUrl}/ja`);
  });
});
