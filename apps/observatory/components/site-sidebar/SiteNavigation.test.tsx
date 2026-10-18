import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { usePathnameMock } = vi.hoisted(() => ({ usePathnameMock: vi.fn() }));

vi.mock('next/navigation', () => ({ usePathname: usePathnameMock }));

import { SiteNavigation } from './SiteNavigation';

describe('SiteNavigation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('marks only the link whose href matches the pathname as current', () => {
    usePathnameMock.mockReturnValue('/catalog');
    const links = [
      { href: '/', label: 'Overview' },
      { href: '/dashboards/summary', label: 'Summary' },
      { href: '/catalog', label: 'Table catalog' },
    ];

    render(<SiteNavigation links={links} />);

    expect(
      screen.getByRole('navigation', { name: 'Observatory' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Table catalog' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: 'Overview' })).not.toHaveAttribute(
      'aria-current'
    );
    expect(screen.getByRole('link', { name: 'Summary' })).not.toHaveAttribute(
      'aria-current'
    );
  });
});
