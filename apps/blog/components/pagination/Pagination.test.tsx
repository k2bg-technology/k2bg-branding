import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Pagination } from './Pagination';

// Renders against the real `ui` Pagination and `next/link` on purpose: the
// point of these tests is the DOM the Base UI Button actually produces for a
// `render` target, so mocking either would hide the semantics under test.

const pathname = '/blog';

let searchParameters = new URLSearchParams();

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useSearchParams: () => searchParameters,
}));

interface RenderOptions {
  count: number;
  currentPage: number;
  category?: string;
}

function renderPagination(options: RenderOptions) {
  const { count, currentPage, category } = options;

  searchParameters = new URLSearchParams({
    page: String(currentPage),
    ...(category === undefined ? {} : { category }),
  });

  return render(<Pagination count={count} />);
}

// The previous/next controls are icon-only and therefore have no accessible
// name, so they are located by their fixed position inside the pagination nav.
function getPreviousControl() {
  return screen.getByRole('navigation').firstElementChild;
}

function getNextControl() {
  return screen.getByRole('navigation').lastElementChild;
}

describe('Pagination', () => {
  it.each([
    { pageLabel: '1', expectedHref: '/blog?page=1&category=engineering' },
    { pageLabel: '2', expectedHref: '/blog?page=2&category=engineering' },
    { pageLabel: '3', expectedHref: '/blog?page=3&category=engineering' },
    { pageLabel: '4', expectedHref: '/blog?page=4&category=engineering' },
    { pageLabel: '5', expectedHref: '/blog?page=5&category=engineering' },
  ])(
    'renders page $pageLabel as a link to $expectedHref that keeps the existing search parameters',
    ({ pageLabel, expectedHref }) => {
      renderPagination({ count: 5, currentPage: 3, category: 'engineering' });

      expect(screen.getByRole('link', { name: pageLabel })).toHaveAttribute(
        'href',
        expectedHref
      );
    }
  );

  it('exposes every numbered page control as a link instead of a button', () => {
    renderPagination({ count: 5, currentPage: 3 });

    expect(screen.getAllByRole('link', { name: /^\d+$/ })).toHaveLength(5);
    expect(
      screen.queryByRole('button', { name: /^\d+$/ })
    ).not.toBeInTheDocument();
  });

  it.each(['1', '2', '3', '4', '5'])(
    'leaves the anchor of page %s without a role attribute',
    (pageLabel) => {
      renderPagination({ count: 5, currentPage: 3 });

      expect(screen.getByRole('link', { name: pageLabel })).not.toHaveAttribute(
        'role'
      );
    }
  );

  it('marks the current page control with aria-current', () => {
    renderPagination({ count: 5, currentPage: 3 });

    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it.each(['1', '2', '4', '5'])(
    'does not mark page %s as the current page',
    (pageLabel) => {
      renderPagination({ count: 5, currentPage: 3 });

      expect(screen.getByRole('link', { name: pageLabel })).not.toHaveAttribute(
        'aria-current'
      );
    }
  );

  it('keeps the tracking attribute on numbered page controls', () => {
    renderPagination({ count: 5, currentPage: 1 });

    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute(
      'data-gtm',
      'article_click_pagination_2'
    );
  });

  it('renders a disabled button as the previous control on the first page', () => {
    renderPagination({ count: 5, currentPage: 1 });

    const previousControl = getPreviousControl();

    expect(previousControl).toBeInstanceOf(HTMLButtonElement);
    expect(previousControl).toBeDisabled();
    expect(previousControl).not.toHaveAttribute('href');
  });

  it('renders a link as the next control on the first page', () => {
    renderPagination({ count: 5, currentPage: 1 });

    const nextControl = getNextControl();

    expect(nextControl).toBeInstanceOf(HTMLAnchorElement);
    expect(nextControl).toHaveAttribute('href', '/blog?page=2');
    expect(nextControl).not.toHaveAttribute('role');
  });

  it('renders a disabled button as the next control on the last page', () => {
    renderPagination({ count: 5, currentPage: 5 });

    const nextControl = getNextControl();

    expect(nextControl).toBeInstanceOf(HTMLButtonElement);
    expect(nextControl).toBeDisabled();
    expect(nextControl).not.toHaveAttribute('href');
  });

  it('renders a link as the previous control on the last page', () => {
    renderPagination({ count: 5, currentPage: 5 });

    const previousControl = getPreviousControl();

    expect(previousControl).toBeInstanceOf(HTMLAnchorElement);
    expect(previousControl).toHaveAttribute('href', '/blog?page=4');
    expect(previousControl).not.toHaveAttribute('role');
  });
});
