import { afterEach, describe, expect, it, vi } from 'vitest';

const configuredBaseUrl = 'https://portfolio.example.com';

// robots.ts resolves the base URL at module scope via ./site, so each test
// re-imports the module after stubbing the environment.
async function importRobots() {
  vi.resetModules();
  return import('./robots');
}

describe('robots', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('allows every user agent to crawl the whole site', async () => {
    vi.stubEnv('PORTFOLIO_SITE_BASE_URL', configuredBaseUrl);
    const { default: sut } = await importRobots();

    const result = sut();

    expect(result.rules).toEqual({ userAgent: '*', allow: '/' });
  });

  it('points the sitemap at the site base URL', async () => {
    vi.stubEnv('PORTFOLIO_SITE_BASE_URL', configuredBaseUrl);
    const { default: sut } = await importRobots();

    const result = sut();

    expect(result.sitemap).toBe(`${configuredBaseUrl}/sitemap.xml`);
  });
});
