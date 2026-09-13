import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LISTED_CATEGORIES } from '../../app/siteMetadata';
import { Category, getCategoryDisplayName } from '../../modules/post/domain';

import { Footer } from './Footer';

describe('Footer', () => {
  it.each(LISTED_CATEGORIES)('links to the %s category', (category) => {
    const expectedName = getCategoryDisplayName(category);
    const expectedHref = `/category/${category}`;
    render(<Footer />);

    const link = screen.getByRole('link', { name: expectedName });

    expect(link).toHaveAttribute('href', expectedHref);
  });

  it('does not link to the unlisted category', () => {
    const unexpectedHref = `/category/${Category.OTHER}`;
    render(<Footer />);

    const hrefs = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));

    expect(hrefs).not.toContain(unexpectedHref);
  });

  it.each([
    { name: 'Concept', expectedHref: '/concept' },
    { name: 'Contact', expectedHref: '/contact' },
  ])('links $name to $expectedHref', ({ name, expectedHref }) => {
    render(<Footer />);

    const link = screen.getByRole('link', { name });

    expect(link).toHaveAttribute('href', expectedHref);
  });
});
