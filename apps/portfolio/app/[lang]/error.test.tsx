import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ErrorBoundaryDictionaryProvider } from '../../components/providers/ErrorBoundaryDictionaryProvider';
import en from '../../i18n/locales/en/translation.json';
import ja from '../../i18n/locales/ja/translation.json';
import type { Dictionary } from '../../i18n/types';

import ErrorBoundary from './error';

const localizedDictionaries = [
  { language: 'ja', dictionary: ja.errorBoundary },
  { language: 'en', dictionary: en.errorBoundary },
];

function createError(digest?: string): Error & { digest?: string } {
  return Object.assign(new Error('Rendering failed'), { digest });
}

function renderErrorBoundary({
  dictionary = en.errorBoundary,
  error = createError(),
  reset = vi.fn(),
}: {
  dictionary?: Dictionary['errorBoundary'];
  error?: Error & { digest?: string };
  reset?: () => void;
} = {}) {
  render(
    <ErrorBoundaryDictionaryProvider dictionary={dictionary}>
      <ErrorBoundary error={error} reset={reset} />
    </ErrorBoundaryDictionaryProvider>
  );
}

describe('ErrorBoundary', () => {
  it.each(localizedDictionaries)(
    'renders the "$language" title and message supplied through the provider',
    ({ dictionary }) => {
      renderErrorBoundary({ dictionary });

      expect(
        screen.getByRole('heading', { name: dictionary.title })
      ).toBeInTheDocument();
      expect(screen.getByText(dictionary.message)).toBeInTheDocument();
    }
  );

  it.each(localizedDictionaries)(
    'labels the retry button with the "$language" retry text',
    ({ dictionary }) => {
      renderErrorBoundary({ dictionary });

      expect(
        screen.getByRole('button', { name: dictionary.retry })
      ).toBeInTheDocument();
    }
  );

  it('calls reset once when the retry button is clicked', async () => {
    const reset = vi.fn();
    const user = userEvent.setup();
    renderErrorBoundary({ dictionary: en.errorBoundary, reset });

    await user.click(
      screen.getByRole('button', { name: en.errorBoundary.retry })
    );

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('renders the error digest so the failure can be traced in server logs', () => {
    const digest = 'a1b2c3d4';

    renderErrorBoundary({ error: createError(digest) });

    expect(screen.getByText(digest)).toBeInTheDocument();
  });
});
