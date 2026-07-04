import type { Language } from '../i18n/settings';

export const siteBaseUrl = new URL(
  process.env.PORTFOLIO_SITE_BASE_URL ?? 'http://localhost:3001'
);

export function getLocalizedUrl(language: Language) {
  return new URL(`/${language}`, siteBaseUrl).toString();
}
