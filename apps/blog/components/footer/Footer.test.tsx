import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LISTED_CATEGORIES } from '../../app/siteMetadata';
import { Category, getCategoryDisplayName } from '../../modules/post/domain';

import { Footer } from './Footer';

describe('Footer', () => {
  it.each(LISTED_CATEGORIES)('links to the %s category', async (category) => {
    const expectedName = getCategoryDisplayName(category);
    const expectedHref = `/category/${category}`;
    render(await Footer());

    const link = screen.getByRole('link', { name: expectedName });

    expect(link).toHaveAttribute('href', expectedHref);
  });

  it('does not link to the unlisted category', async () => {
    const unexpectedHref = `/category/${Category.OTHER}`;
    render(await Footer());

    const hrefs = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));

    expect(hrefs).not.toContain(unexpectedHref);
  });

  it.each([
    { name: 'Concept', expectedHref: '/concept' },
    { name: 'Contact', expectedHref: '/contact' },
  ])('links $name to $expectedHref', async ({ name, expectedHref }) => {
    render(await Footer());

    const link = screen.getByRole('link', { name });

    expect(link).toHaveAttribute('href', expectedHref);
  });
});

vi.mock('next/cache', () => ({ cacheLife: vi.fn() }));
