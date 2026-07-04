import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LanguageSelector } from './LanguageSelector';

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
});
