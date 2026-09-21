import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { LISTED_CATEGORIES } from '../../app/siteMetadata';
import { Category, getCategoryDisplayName } from '../../modules/post/domain';

import { Header } from './Header';

vi.mock('./MotionHeader', () => ({
  MotionHeader: ({ children }: PropsWithChildren) => (
    <header>{children}</header>
  ),
}));

vi.mock('../search/Search', () => ({
  Search: () => <div data-testid="search" />,
}));

vi.mock('../sidebar/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar" />,
}));

// The desktop navigation and the mobile menu repeat every label, so a lookup by
// name yields one element per navigation that is currently mounted.
function getDistinctHrefsByLinkName(name: string) {
  const hrefs = screen
    .getAllByRole('link', { name })
    .map((link) => link.getAttribute('href'));

  return Array.from(new Set(hrefs));
}

describe('Header', () => {
  it.each(LISTED_CATEGORIES)('links to the %s category', (category) => {
    const expectedHrefs = [`/category/${category}`];
    render(<Header />);

    const hrefs = getDistinctHrefsByLinkName(getCategoryDisplayName(category));

    expect(hrefs).toEqual(expectedHrefs);
  });

  it('does not link to the unlisted category', () => {
    const unexpectedHref = `/category/${Category.OTHER}`;
    render(<Header />);

    const hrefs = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));

    expect(hrefs).not.toContain(unexpectedHref);
  });

  it.each([
    { name: 'Concept', expectedHref: '/concept' },
    { name: 'Contact', expectedHref: '/contact' },
  ])('links $name to $expectedHref', ({ name, expectedHref }) => {
    const expectedHrefs = [expectedHref];
    render(<Header />);

    const hrefs = getDistinctHrefsByLinkName(name);

    expect(hrefs).toEqual(expectedHrefs);
  });
});
