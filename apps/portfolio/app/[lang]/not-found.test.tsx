import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import en from '../../i18n/locales/en/translation.json';
import ja from '../../i18n/locales/ja/translation.json';
import { getRequestLanguage } from '../../i18n/requestLanguage';
import type { Language } from '../../i18n/settings';

import NotFound from './not-found';

// dictionaries.ts imports `server-only`, which throws outside a Next.js server
// build. Stub it so the boundary can load the real translation files.
vi.mock('server-only', () => ({}));

vi.mock('../../i18n/requestLanguage', () => ({
  getRequestLanguage: vi.fn(),
}));

const localizedBoundaries = [
  { language: 'ja', notFound: ja.notFound },
  { language: 'en', notFound: en.notFound },
] satisfies { language: Language; notFound: (typeof en)['notFound'] }[];

async function renderNotFound(language: Language) {
  vi.mocked(getRequestLanguage).mockResolvedValue(language);

  render(await NotFound());
}

describe('NotFound', () => {
  it.each(localizedBoundaries)(
    'renders the "$language" title and message for the resolved request language',
    async ({ language, notFound }) => {
      await renderNotFound(language);

      expect(
        screen.getByRole('heading', { name: notFound.title })
      ).toBeInTheDocument();
      expect(screen.getByText(notFound.message)).toBeInTheDocument();
    }
  );

  it.each(localizedBoundaries)(
    'links back to the "$language" home page',
    async ({ language, notFound }) => {
      await renderNotFound(language);

      expect(
        screen.getByRole('link', { name: notFound.returnHome })
      ).toHaveAttribute('href', `/${language}`);
    }
  );

  it('renders the 404 status code', async () => {
    const statusCode = '404';

    await renderNotFound('en');

    expect(screen.getByText(statusCode)).toBeInTheDocument();
  });
});
