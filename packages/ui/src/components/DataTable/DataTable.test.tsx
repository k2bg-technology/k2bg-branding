import {
  act,
  type RenderResult,
  render,
  screen,
  within,
} from '@testing-library/react';
import type { ReactElement } from 'react';
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

const pivotColumns: DataTableColumn[] = [
  { id: 'category', header: 'Category' },
  { id: 'january', header: 'January', align: 'end' },
  { id: 'february', header: 'February', align: 'end' },
  { id: 'total', header: 'Total', align: 'end', emphasis: true },
];

const pivotRows: DataTableRow[] = [
  {
    id: 'housing',
    cells: {
      category: 'Housing',
      january: '¥120,000',
      february: '¥120,000',
      total: '¥240,000',
    },
  },
  {
    id: 'food',
    cells: {
      category: 'Food',
      january: '¥48,000',
      february: '¥52,000',
      total: '¥100,000',
    },
  },
];

/** Base UI's scroll area marks its viewport — the real scroll port — with this data id. */
const scrollPortSelector = '[data-id$="-viewport"]';

const pivotFooter: DataTableRow['cells'] = {
  category: 'Total',
  january: '¥168,000',
  february: '¥172,000',
  total: '¥340,000',
};

/** Base UI's scroll area measures in a microtask; flush it so React stays inside `act`. */
async function renderDataTable(ui: ReactElement): Promise<RenderResult> {
  const result = render(ui);
  await act(async () => {
    // Yielding once is what drains the queued measurement.
  });
  return result;
}

describe('DataTable', () => {
  it('names the table with the caption', async () => {
    const caption = 'Allocation by asset class';

    await renderDataTable(
      <DataTable caption={caption} columns={columns} rows={rows} />
    );

    expect(screen.getByRole('table', { name: caption })).toBeInTheDocument();
  });

  it('renders one column header per column', async () => {
    await renderDataTable(
      <DataTable caption="Allocation" columns={columns} rows={rows} />
    );

    const headers = screen.getAllByRole('columnheader');
    expect(headers.map((header) => header.textContent)).toEqual([
      'Asset class',
      'Value',
    ]);
  });

  it('renders the cells of every row under their column', async () => {
    await renderDataTable(
      <DataTable caption="Allocation" columns={columns} rows={rows} />
    );

    const bondsRow = screen.getByRole('row', { name: /Bonds/ });
    const cells = within(bondsRow).getAllByRole('cell');
    expect(cells.map((cell) => cell.textContent)).toEqual([
      'Bonds',
      '¥2,496,000',
    ]);
  });

  it('renders an empty cell for a missing cell value', async () => {
    const sparseRows: DataTableRow[] = [
      { id: 'cash', cells: { assetClass: 'Cash' } },
    ];

    await renderDataTable(
      <DataTable caption="Allocation" columns={columns} rows={sparseRows} />
    );

    const cashRow = screen.getByRole('row', { name: /Cash/ });
    const cells = within(cashRow).getAllByRole('cell');
    expect(cells.map((cell) => cell.textContent)).toEqual(['Cash', '']);
  });

  it('keeps the caption accessible when it is visually hidden', async () => {
    const caption = 'Allocation by asset class';

    await renderDataTable(
      <DataTable
        caption={caption}
        columns={columns}
        rows={rows}
        visuallyHiddenCaption
      />
    );

    expect(screen.getByRole('table', { name: caption })).toBeInTheDocument();
  });

  it('renders the empty message in one cell spanning every column', async () => {
    const emptyMessage = 'No allocations recorded for this period';

    await renderDataTable(
      <DataTable
        caption="Allocation"
        columns={columns}
        rows={[]}
        emptyMessage={emptyMessage}
      />
    );

    const emptyCell = screen.getByRole('cell', { name: emptyMessage });
    expect(emptyCell).toHaveAttribute('colspan', String(columns.length));
  });

  it('renders no body cells when rows are empty and no empty message is given', async () => {
    await renderDataTable(
      <DataTable caption="Allocation" columns={columns} rows={[]} />
    );

    expect(screen.queryByRole('cell')).not.toBeInTheDocument();
  });

  it('names the region that wraps the scrolling table', async () => {
    const caption = 'Allocation by asset class';

    await renderDataTable(
      <DataTable caption={caption} columns={columns} rows={rows} />
    );

    const scrollRegion = screen.getByRole('region', { name: caption });
    expect(
      within(scrollRegion).getByRole('table', { name: caption })
    ).toBeInTheDocument();
  });

  it('keeps the scroll port out of the tab order while nothing overflows', async () => {
    const caption = 'Allocation by asset class';

    const { container } = await renderDataTable(
      <DataTable caption={caption} columns={columns} rows={rows} />
    );

    expect(container.querySelector(scrollPortSelector)).toHaveAttribute(
      'tabindex',
      '-1'
    );
  });

  it('renders no footer row group when no footer cells are given', async () => {
    await renderDataTable(
      <DataTable caption="Allocation" columns={columns} rows={rows} />
    );

    const headerAndBody = 2;
    expect(screen.getAllByRole('rowgroup')).toHaveLength(headerAndBody);
  });

  it('renders the footer cells in column order', async () => {
    await renderDataTable(
      <DataTable
        caption="Spending by category"
        columns={pivotColumns}
        rows={pivotRows}
        footer={pivotFooter}
      />
    );

    const totalsRow = screen.getByRole('row', { name: /¥340,000/ });
    expect(within(totalsRow).getByRole('rowheader')).toHaveTextContent('Total');
    expect(
      within(totalsRow)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual(['¥168,000', '¥172,000', '¥340,000']);
  });

  it('renders an empty footer cell for a missing footer value', async () => {
    await renderDataTable(
      <DataTable
        caption="Spending by category"
        columns={pivotColumns}
        rows={pivotRows}
        footer={{ category: 'Total', total: '¥340,000' }}
      />
    );

    const totalsRow = screen.getByRole('row', { name: /¥340,000/ });
    expect(
      within(totalsRow)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual(['', '', '¥340,000']);
  });

  it('marks the emphasised column in the header, the body, and the footer', async () => {
    const { container } = await renderDataTable(
      <DataTable
        caption="Spending by category"
        columns={pivotColumns}
        rows={pivotRows}
        footer={pivotFooter}
      />
    );

    const emphasisedCells = container.querySelectorAll(
      '[data-emphasis="true"]'
    );
    expect(Array.from(emphasisedCells).map((cell) => cell.textContent)).toEqual(
      ['Total', '¥240,000', '¥100,000', '¥340,000']
    );
  });

  it('pins the first column in the header, the body, and the footer when it is sticky', async () => {
    const { container } = await renderDataTable(
      <DataTable
        caption="Spending by category"
        columns={pivotColumns}
        rows={pivotRows}
        footer={pivotFooter}
        stickyFirstColumn
      />
    );

    const stickyCells = container.querySelectorAll('[data-sticky="true"]');
    expect(Array.from(stickyCells).map((cell) => cell.textContent)).toEqual([
      'Category',
      'Housing',
      'Food',
      'Total',
    ]);
  });

  it('turns the body cells of a sticky first column into row headers', async () => {
    await renderDataTable(
      <DataTable
        caption="Spending by category"
        columns={pivotColumns}
        rows={pivotRows}
        stickyFirstColumn
      />
    );

    expect(
      screen.getAllByRole('rowheader').map((header) => header.textContent)
    ).toEqual(['Housing', 'Food']);
  });

  it('keeps the body cells of the first column as data cells without the sticky column', async () => {
    await renderDataTable(
      <DataTable
        caption="Spending by category"
        columns={pivotColumns}
        rows={pivotRows}
      />
    );

    expect(screen.queryByRole('rowheader')).not.toBeInTheDocument();
  });

  it('keeps a right-aligned first column as data cells even when it is sticky', async () => {
    const numberFirstColumns: DataTableColumn[] = [
      { id: 'january', header: 'January', align: 'end' },
      { id: 'category', header: 'Category' },
    ];
    const numberFirstRows: DataTableRow[] = [
      { id: 'housing', cells: { january: '¥120,000', category: 'Housing' } },
    ];

    await renderDataTable(
      <DataTable
        caption="Spending by month"
        columns={numberFirstColumns}
        rows={numberFirstRows}
        footer={{ january: '¥168,000', category: 'Total' }}
        stickyFirstColumn
      />
    );

    expect(screen.queryByRole('rowheader')).not.toBeInTheDocument();
    const totalsRow = screen.getByRole('row', { name: /¥168,000/ });
    expect(
      within(totalsRow)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual(['¥168,000', 'Total']);
  });
});
