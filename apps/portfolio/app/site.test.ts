import { afterEach, describe, expect, it, vi } from 'vitest';

const configuredBaseUrl = 'https://portfolio.example.com';

const absentValueCases = [
  { description: 'missing', value: undefined },
  { description: 'blank', value: '' },
  { description: 'whitespace-only', value: '   ' },
];

// siteBaseUrl is resolved at module scope, so each test re-imports the module
// after stubbing the environment.
async function importSite() {
  vi.resetModules();
  return import('./site');
}

describe('siteBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses PORTFOLIO_SITE_BASE_URL when it is set', async () => {
    vi.stubEnv('PORTFOLIO_SITE_BASE_URL', configuredBaseUrl);

    const { siteBaseUrl } = await importSite();

    expect(siteBaseUrl.href).toBe(`${configuredBaseUrl}/`);
  });

  it('uses PORTFOLIO_SITE_BASE_URL in production when it is set', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('PORTFOLIO_SITE_BASE_URL', configuredBaseUrl);

    const { siteBaseUrl } = await importSite();

    expect(siteBaseUrl.href).toBe(`${configuredBaseUrl}/`);
  });

  it.each(
    absentValueCases
  )('falls back to http://localhost:3001 outside production when PORTFOLIO_SITE_BASE_URL is $description', async ({
    value,
  }) => {
    vi.stubEnv('PORTFOLIO_SITE_BASE_URL', value);

    const { siteBaseUrl } = await importSite();

    expect(siteBaseUrl.href).toBe('http://localhost:3001/');
  });

  it.each(
    absentValueCases
  )('throws in production when PORTFOLIO_SITE_BASE_URL is $description', async ({
    value,
  }) => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('PORTFOLIO_SITE_BASE_URL', value);

    await expect(importSite()).rejects.toThrow(
      'PORTFOLIO_SITE_BASE_URL environment variable is required in production'
    );
  });
});

describe('getLocalizedUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    'ja',
    'en',
  ] as const)('returns the base URL suffixed with the language path for "%s"', async (language) => {
    vi.stubEnv('PORTFOLIO_SITE_BASE_URL', configuredBaseUrl);
    const { getLocalizedUrl } = await importSite();

    const localizedUrl = getLocalizedUrl(language);

    expect(localizedUrl).toBe(`${configuredBaseUrl}/${language}`);
  });
});
