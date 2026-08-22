import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Page from './page';

vi.mock('../infrastructure', () => ({
  createFetchTableCatalogUseCase: vi.fn(),
}));

vi.mock('../components/table-catalog/TableCatalog', () => ({
  TableCatalog: () => <div>TableCatalog</div>,
}));

describe('Page', () => {
  it('renders the app name as the heading', () => {
    const expectedHeading = 'Observatory';

    render(<Page />);

    expect(
      screen.getByRole('heading', { name: expectedHeading })
    ).toBeInTheDocument();
  });

  it('renders the table catalog section', () => {
    render(<Page />);

    expect(
      screen.getByRole('heading', { name: 'Table catalog' })
    ).toBeInTheDocument();
  });
});
