import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TablePagination } from './TablePagination';

const labels = {
  previousPage: 'Previous page',
  nextPage: 'Next page',
  pagination: 'Pagination',
};

describe('TablePagination', () => {
  it('links pages while preserving other parameters and names the navigation', () => {
    render(
      <TablePagination
        pageCount={3}
        currentPage={2}
        path="/dashboards/summary"
        query="period=2026-08&page.other=4&note=kept"
        pageKey="page.detail"
        labels={labels}
      />
    );
    const navigation = screen.getByRole('navigation', { name: 'Pagination' });
    expect(within(navigation).getByRole('link', { name: '1' })).toHaveAttribute(
      'href',
      '/dashboards/summary?period=2026-08&page.other=4&note=kept'
    );
    expect(within(navigation).getByRole('link', { name: '3' })).toHaveAttribute(
      'href',
      '/dashboards/summary?period=2026-08&page.other=4&note=kept&page.detail=3'
    );
    expect(
      within(navigation).getByRole('link', { name: 'Previous page' })
    ).toHaveAttribute(
      'href',
      '/dashboards/summary?period=2026-08&page.other=4&note=kept'
    );
    expect(
      within(navigation).getByRole('link', { name: 'Next page' })
    ).toHaveAttribute(
      'href',
      '/dashboards/summary?period=2026-08&page.other=4&note=kept&page.detail=3'
    );
    expect(within(navigation).getByRole('link', { name: '2' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('omits the query delimiter for the first page without parameters', () => {
    render(
      <TablePagination
        pageCount={2}
        currentPage={2}
        path="/dashboards/summary"
        query=""
        pageKey="page.detail"
        labels={labels}
      />
    );
    expect(screen.getByRole('link', { name: '1' })).toHaveAttribute(
      'href',
      '/dashboards/summary'
    );
  });

  it('uses disabled buttons at the first and last pages', () => {
    const first = render(
      <TablePagination
        pageCount={3}
        currentPage={1}
        path="/dashboards/summary"
        query=""
        pageKey="page.detail"
        labels={labels}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Previous page' })
    ).toBeDisabled();
    expect(
      screen.queryByRole('link', { name: 'Previous page' })
    ).not.toBeInTheDocument();
    first.rerender(
      <TablePagination
        pageCount={3}
        currentPage={3}
        path="/dashboards/summary"
        query=""
        pageKey="page.detail"
        labels={labels}
      />
    );
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(
      screen.queryByRole('link', { name: 'Next page' })
    ).not.toBeInTheDocument();
  });

  it('uses overridden labels', () => {
    render(
      <TablePagination
        pageCount={3}
        currentPage={2}
        path="/dashboards/summary"
        query=""
        pageKey="page.detail"
        labels={{
          previousPage: 'Earlier page',
          nextPage: 'Later page',
          pagination: 'Entry pages',
        }}
      />
    );
    expect(
      screen.getByRole('navigation', { name: 'Entry pages' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Earlier page' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Later page' })
    ).toBeInTheDocument();
  });
});
