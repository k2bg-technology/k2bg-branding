import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import en from '../../i18n/locales/en/translation.json';
import ja from '../../i18n/locales/ja/translation.json';

import {
  ErrorBoundaryDictionaryProvider,
  useErrorBoundaryDictionary,
} from './ErrorBoundaryDictionaryProvider';

function DictionaryProbe() {
  const { title, message, retry } = useErrorBoundaryDictionary();

  return (
    <ul>
      <li>{title}</li>
      <li>{message}</li>
      <li>{retry}</li>
    </ul>
  );
}

describe('useErrorBoundaryDictionary', () => {
  it('exposes the dictionary supplied by the provider', () => {
    render(
      <ErrorBoundaryDictionaryProvider dictionary={en.errorBoundary}>
        <DictionaryProbe />
      </ErrorBoundaryDictionaryProvider>
    );

    expect(screen.getByText(en.errorBoundary.title)).toBeInTheDocument();
    expect(screen.getByText(en.errorBoundary.message)).toBeInTheDocument();
    expect(screen.getByText(en.errorBoundary.retry)).toBeInTheDocument();
  });

  // The hook is defensive: without a provider it still returns readable copy,
  // which must stay in sync with the default language dictionary.
  it('falls back to the default language copy when no provider is mounted', () => {
    render(<DictionaryProbe />);

    expect(screen.getByText(ja.errorBoundary.title)).toBeInTheDocument();
    expect(screen.getByText(ja.errorBoundary.message)).toBeInTheDocument();
    expect(screen.getByText(ja.errorBoundary.retry)).toBeInTheDocument();
  });
});
