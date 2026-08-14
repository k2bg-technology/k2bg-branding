import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { LanguageSelector } from './LanguageSelector';

// Expose Link's prefetch prop in the DOM so tests can guard the
// prefetch={false} fix for issue #341 (next/link never renders it).
vi.mock('next/link', () => ({
  default: ({
    prefetch,
    children,
    ...anchorProps
  }: ComponentProps<'a'> & { prefetch?: boolean }) => (
    <a {...anchorProps} data-prefetch={String(prefetch)}>
      {children}
    </a>
  ),
}));

describe('LanguageSelector', () => {
  it('renders a link to the Japanese locale', () => {
    render(<LanguageSelector />);

    expect(screen.getByRole('link', { name: 'ja' })).toHaveAttribute(
      'href',
      '/ja'
    );
  });

  it('renders a link to the English locale', () => {
    render(<LanguageSelector />);

    expect(screen.getByRole('link', { name: 'en' })).toHaveAttribute(
      'href',
      '/en'
    );
  });

  it.each([
    { locale: 'ja' },
    { locale: 'en' },
  ])('disables prefetching on the $locale locale link so the switch hits the middleware', ({
    locale,
  }) => {
    render(<LanguageSelector />);

    expect(screen.getByRole('link', { name: locale })).toHaveAttribute(
      'data-prefetch',
      'false'
    );
  });
});
