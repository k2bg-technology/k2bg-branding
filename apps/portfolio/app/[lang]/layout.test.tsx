/**
 * @vitest-environment node
 *
 * The layout is exercised through the server renderer, so it needs the server
 * environment: the dictionary provider it mounts is a client component whose
 * hooks run under jsdom without the globals the real server provides.
 */
import { renderToReadableStream } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { useErrorBoundaryDictionary } from '../../components/providers/ErrorBoundaryDictionaryProvider';

import en from '../../i18n/locales/en/translation.json';
import ja from '../../i18n/locales/ja/translation.json';
import { fallbackLanguage, type Language } from '../../i18n/settings';
import type { Dictionary } from '../../i18n/types';

import RootLayout from './layout';

// dictionaries.ts imports `server-only`, which throws outside a Next.js server
// build. Stub it so the layout can load the real translation files.
vi.mock('server-only', () => ({}));

const localizedLayouts = [
  {
    language: 'ja',
    errorBoundary: ja.errorBoundary,
    otherLanguageTitle: en.errorBoundary.title,
  },
  {
    language: 'en',
    errorBoundary: en.errorBoundary,
    otherLanguageTitle: ja.errorBoundary.title,
  },
] satisfies {
  language: Language;
  errorBoundary: Dictionary['errorBoundary'];
  otherLanguageTitle: string;
}[];

/**
 * Consumes the context the layout is expected to provide. Without the
 * provider the hook silently falls back to the default language, so this is
 * what makes a missing or mismatched dictionary visible in the markup.
 */
function ErrorBoundaryDictionaryProbe() {
  const { title, message, retry } = useErrorBoundaryDictionary();

  return (
    <ul>
      <li>{title}</li>
      <li>{message}</li>
      <li>{retry}</li>
    </ul>
  );
}

async function renderLayoutHtml(lang: string) {
  const stream = await renderToReadableStream(
    <RootLayout params={Promise.resolve({ lang })}>
      <ErrorBoundaryDictionaryProbe />
    </RootLayout>
  );
  await stream.allReady;

  return new Response(stream).text();
}

describe('RootLayout', () => {
  it.each(localizedLayouts)(
    'sets the document language to "$language"',
    async ({ language }) => {
      const html = await renderLayoutHtml(language);

      expect(html).toContain(`<html lang="${language}"`);
    }
  );

  it.each(localizedLayouts)(
    'provides the "$language" error boundary dictionary to its children',
    async ({ language, errorBoundary }) => {
      const html = await renderLayoutHtml(language);

      expect(html).toContain(errorBoundary.title);
      expect(html).toContain(errorBoundary.message);
      expect(html).toContain(errorBoundary.retry);
    }
  );

  it.each(localizedLayouts)(
    'does not leak another language into the "$language" error boundary dictionary',
    async ({ language, otherLanguageTitle }) => {
      const html = await renderLayoutHtml(language);

      expect(html).not.toContain(otherLanguageTitle);
    }
  );

  it('provides the default language dictionary when the lang param is unsupported', async () => {
    const html = await renderLayoutHtml('fr');

    expect(html).toContain(`<html lang="${fallbackLanguage}"`);
    expect(html).toContain(ja.errorBoundary.title);
  });
});
