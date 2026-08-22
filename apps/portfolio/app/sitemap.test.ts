import { afterEach, describe, expect, it, vi } from 'vitest';

const configuredBaseUrl = 'https://portfolio.example.com';

// sitemap.ts resolves the base URL at module scope via ./site, so each test
// re-imports the module after stubbing the environment.
async function importSitemap() {
  vi.resetModules();
  return import('./sitemap');
}

describe('sitemap', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns one entry per supported language with its localized URL', async () => {
    vi.stubEnv('PORTFOLIO_SITE_BASE_URL', configuredBaseUrl);
    const { default: sut } = await importSitemap();

    const entries = sut();

    expect(entries.map((entry) => entry.url)).toEqual([
      `${configuredBaseUrl}/ja`,
      `${configuredBaseUrl}/en`,
    ]);
  });

  it('includes hreflang alternates for every supported language on each entry', async () => {
    vi.stubEnv('PORTFOLIO_SITE_BASE_URL', configuredBaseUrl);
    const { default: sut } = await importSitemap();

    const entries = sut();

    const expectedAlternates = {
      ja: `${configuredBaseUrl}/ja`,
      en: `${configuredBaseUrl}/en`,
    };
    expect(entries.map((entry) => entry.alternates?.languages)).toEqual([
      expectedAlternates,
      expectedAlternates,
    ]);
  });
});
