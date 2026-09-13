/**
 * @vitest-environment node
 *
 * The page is exercised through the server renderer, so it needs the server
 * environment: jsdom defines `window` without `matchMedia`, which breaks the
 * client hooks below the boundary in a way the real server never does.
 */
import { renderToReadableStream } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import en from '../../i18n/locales/en/translation.json';
import ja from '../../i18n/locales/ja/translation.json';
import type { Language } from '../../i18n/settings';

import Page from './page';

// dictionaries.ts imports `server-only`, which throws outside a Next.js server
// build. Stub it so the page can load the real translation files.
vi.mock('server-only', () => ({}));

type RouteParams = { lang: string };

const spinnerClassName = 'animate-spin';
const decoder = new TextDecoder();

const localizedPages = [
  { language: 'ja', slogan: ja.hero.slogan },
  { language: 'en', slogan: en.hero.slogan },
] satisfies { language: Language; slogan: string }[];

function createDeferredParams() {
  let resolveParams: (params: RouteParams) => void = () => undefined;
  const params = new Promise<RouteParams>((resolve) => {
    resolveParams = resolve;
  });

  return { params, resolveParams };
}

/**
 * Wraps the page in the document shell `app/[lang]/layout.tsx` renders: React
 * only flushes a shell once `<html>` and `<body>` are known.
 */
async function renderPageStream(
  language: Language,
  params: Promise<RouteParams>
) {
  const stream = await renderToReadableStream(
    <html lang={language}>
      <body>
        <Page params={params} />
      </body>
    </html>
  );

  return stream.getReader();
}

async function readChunk(
  reader: ReadableStreamDefaultReader<Uint8Array>
): Promise<string | null> {
  const { value, done } = await reader.read();

  return done || value === undefined
    ? null
    : decoder.decode(value, { stream: true });
}

async function readRemainingHtml(
  reader: ReadableStreamDefaultReader<Uint8Array>
): Promise<string> {
  let html = '';
  let chunk = await readChunk(reader);

  while (chunk !== null) {
    html += chunk;
    chunk = await readChunk(reader);
  }

  return html;
}

describe('Page', () => {
  it('streams the loading fallback while the awaited params are pending', async () => {
    const { params } = createDeferredParams();
    const reader = await renderPageStream('ja', params);

    const shellHtml = await readChunk(reader);

    expect(shellHtml).toContain(spinnerClassName);
    expect(shellHtml).not.toContain(ja.hero.slogan);
  });

  it('streams the page content after the fallback once the params resolve', async () => {
    const { params, resolveParams } = createDeferredParams();
    const reader = await renderPageStream('ja', params);
    await readChunk(reader);

    resolveParams({ lang: 'ja' });
    const streamedHtml = await readRemainingHtml(reader);

    expect(streamedHtml).toContain(ja.hero.slogan);
  });

  it.each(localizedPages)(
    'renders the "$language" content for the resolved language',
    async ({ language, slogan }) => {
      const reader = await renderPageStream(
        language,
        Promise.resolve({ lang: language })
      );

      const html = await readRemainingHtml(reader);

      expect(html).toContain(slogan);
    }
  );
});
