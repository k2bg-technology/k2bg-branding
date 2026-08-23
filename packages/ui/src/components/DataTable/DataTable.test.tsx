import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DataTable, type DataTableColumn, type DataTableRow } from '.';

const columns: DataTableColumn[] = [
  { id: 'assetClass', header: 'Asset class' },
  { id: 'value', header: 'Value', align: 'end' },
];

const rows: DataTableRow[] = [
  { id: 'equities', cells: { assetClass: 'Equities', value: '¥7,488,000' } },
  { id: 'bonds', cells: { assetClass: 'Bonds', value: '¥2,496,000' } },
];

describe('DataTable', () => {
  it('names the table with the caption', () => {
    const caption = 'Allocation by asset class';

    render(<DataTable caption={caption} columns={columns} rows={rows} />);

    expect(screen.getByRole('table', { name: caption })).toBeInTheDocument();
  });

  it('renders one column header per column', () => {
    render(<DataTable caption="Allocation" columns={columns} rows={rows} />);

    const headers = screen.getAllByRole('columnheader');
    expect(headers.map((header) => header.textContent)).toEqual([
      'Asset class',
      'Value',
    ]);
  });

  it('renders the cells of every row under their column', () => {
    render(<DataTable caption="Allocation" columns={columns} rows={rows} />);

    const bondsRow = screen.getByRole('row', { name: /Bonds/ });
    const cells = within(bondsRow).getAllByRole('cell');
    expect(cells.map((cell) => cell.textContent)).toEqual([
      'Bonds',
      '¥2,496,000',
    ]);
  });

  it('right-aligns columns with align end', () => {
    render(<DataTable caption="Allocation" columns={columns} rows={rows} />);

    const valueHeader = screen.getByRole('columnheader', { name: 'Value' });
    expect(valueHeader).toHaveClass('text-right');
  });

  it('renders an empty cell for a missing cell value', () => {
    const sparseRows: DataTableRow[] = [
      { id: 'cash', cells: { assetClass: 'Cash' } },
    ];

    render(
      <DataTable caption="Allocation" columns={columns} rows={sparseRows} />
    );

    const cashRow = screen.getByRole('row', { name: /Cash/ });
    const cells = within(cashRow).getAllByRole('cell');
    expect(cells.map((cell) => cell.textContent)).toEqual(['Cash', '']);
  });

  it('keeps the caption accessible when it is visually hidden', () => {
    const caption = 'Allocation by asset class';

    render(
      <DataTable
        caption={caption}
        columns={columns}
        rows={rows}
        visuallyHiddenCaption
      />
    );

    expect(screen.getByRole('table', { name: caption })).toBeInTheDocument();
    expect(screen.getByText(caption)).toHaveClass('sr-only');
  });
});
