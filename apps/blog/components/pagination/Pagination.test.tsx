import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Pagination } from './Pagination';

// Renders against the real `ui` Pagination and `next/link` on purpose: the
// point of these tests is the DOM the Base UI Button actually produces for a
// `render` target, so mocking either would hide the semantics under test.

const pathname = '/blog';
const previousPageLabel = '前のページ';
const nextPageLabel = '次のページ';

const useSearchParamsMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useSearchParams: useSearchParamsMock,
}));

interface RenderOptions {
  count: number;
  currentPage: number;
  category?: string;
}

function renderPagination(options: RenderOptions) {
  const { count, currentPage, category } = options;

  useSearchParamsMock.mockReturnValue(
    new URLSearchParams({
      page: String(currentPage),
      ...(category === undefined ? {} : { category }),
    })
  );

  return render(<Pagination count={count} />);
}

describe('Pagination', () => {
  it('renders a page as a link that keeps the existing search parameters', () => {
    const pageLabel = '2';
    const expectedHref = '/blog?page=2&category=engineering';

    renderPagination({ count: 5, currentPage: 3, category: 'engineering' });

    expect(screen.getByRole('link', { name: pageLabel })).toHaveAttribute(
      'href',
      expectedHref
    );
  });

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

  it('does not mark a non-selected page as the current page', () => {
    const pageLabel = '2';

    renderPagination({ count: 5, currentPage: 3 });

    expect(screen.getByRole('link', { name: pageLabel })).not.toHaveAttribute(
      'aria-current'
    );
  });

  it('keeps the tracking attribute on numbered page controls', () => {
    renderPagination({ count: 5, currentPage: 1 });

    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute(
      'data-gtm',
      'article_click_pagination_2'
    );
  });

  it('renders a disabled button as the previous control on the first page', () => {
    renderPagination({ count: 5, currentPage: 1 });

    const previousControl = screen.getByRole('button', {
      name: previousPageLabel,
    });

    expect(previousControl).toBeInstanceOf(HTMLButtonElement);
    expect(previousControl).toBeDisabled();
    expect(previousControl).not.toHaveAttribute('href');
  });

  it('renders a link as the next control on the first page', () => {
    renderPagination({ count: 5, currentPage: 1 });

    const nextControl = screen.getByRole('link', { name: nextPageLabel });

    expect(nextControl).toBeInstanceOf(HTMLAnchorElement);
    expect(nextControl).toHaveRole('link');
    expect(nextControl).toHaveAttribute('href', '/blog?page=2');
  });

  it('renders a disabled button as the next control on the last page', () => {
    renderPagination({ count: 5, currentPage: 5 });

    const nextControl = screen.getByRole('button', { name: nextPageLabel });

    expect(nextControl).toBeInstanceOf(HTMLButtonElement);
    expect(nextControl).toBeDisabled();
    expect(nextControl).not.toHaveAttribute('href');
  });

  it('renders a link as the previous control on the last page', () => {
    renderPagination({ count: 5, currentPage: 5 });

    const previousControl = screen.getByRole('link', {
      name: previousPageLabel,
    });

    expect(previousControl).toBeInstanceOf(HTMLAnchorElement);
    expect(previousControl).toHaveRole('link');
    expect(previousControl).toHaveAttribute('href', '/blog?page=4');
  });
});
