import type { Language } from '../i18n/settings';

function resolveSiteBaseUrl(): URL {
  const configuredBaseUrl = process.env.PORTFOLIO_SITE_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return new URL(configuredBaseUrl);
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'PORTFOLIO_SITE_BASE_URL environment variable is required in production'
    );
  }

  return new URL('http://localhost:3001');
}

export const siteBaseUrl = resolveSiteBaseUrl();

export function getLocalizedUrl(language: Language) {
  return new URL(`/${language}`, siteBaseUrl).toString();
}
