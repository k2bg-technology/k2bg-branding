import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RepositoryError } from '../../modules/catalog/adapters';
import {
  type TableSummaryOutput,
  TableType,
} from '../../modules/catalog/use-cases';
import { TableCatalog } from './TableCatalog';

const { errorMock } = vi.hoisted(() => ({ errorMock: vi.fn() }));

vi.mock('../../modules/catalog/adapters/shared/logger', () => ({
  catalogLogger: { error: errorMock },
}));

function createTableSummaryOutput(
  overrides: Partial<TableSummaryOutput> = {}
): TableSummaryOutput {
  return {
    datasetId: 'sample_dataset',
    name: 'daily_totals',
    type: TableType.TABLE,
    rowCount: 1200,
    sizeInBytes: 65536,
    lastModifiedAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('TableCatalog', () => {
  beforeEach(() => {
    errorMock.mockClear();
  });

  it('renders one row per table with formatted values', async () => {
    const tables = [
      createTableSummaryOutput({
        name: 'daily_totals',
        rowCount: 12,
        sizeInBytes: 512,
        lastModifiedAt: '2026-07-15T09:30:00.000Z',
      }),
      createTableSummaryOutput({
        datasetId: 'other_dataset',
        name: 'monthly_totals',
        lastModifiedAt: null,
      }),
    ];
    const fetchTableCatalog = vi.fn().mockResolvedValue(tables);

    render(await TableCatalog({ fetchTableCatalog }));

    expect(
      screen.getByRole('rowheader', { name: 'daily_totals' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('rowheader', { name: 'monthly_totals' })
    ).toBeInTheDocument();
    expect(screen.getByText('sample_dataset')).toBeInTheDocument();
    expect(screen.getByText('other_dataset')).toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('64.0 KB')).toBeInTheDocument();
    expect(screen.getByText('2026-07-15')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders the type of each entry', async () => {
    const tables = [
      createTableSummaryOutput({ type: TableType.TABLE }),
      createTableSummaryOutput({
        name: 'daily_summary',
        type: TableType.VIEW,
        rowCount: null,
        sizeInBytes: null,
        lastModifiedAt: null,
      }),
    ];
    const fetchTableCatalog = vi.fn().mockResolvedValue(tables);

    render(await TableCatalog({ fetchTableCatalog }));

    expect(screen.getByText('table')).toBeInTheDocument();
    expect(screen.getByText('view')).toBeInTheDocument();
  });

  it('renders a dash for an entry without storage', async () => {
    const tables = [
      createTableSummaryOutput({
        type: TableType.VIEW,
        rowCount: null,
        sizeInBytes: null,
        lastModifiedAt: null,
      }),
    ];
    const fetchTableCatalog = vi.fn().mockResolvedValue(tables);

    render(await TableCatalog({ fetchTableCatalog }));

    const expectedDashCount = 3;
    expect(screen.getAllByText('—')).toHaveLength(expectedDashCount);
  });

  it('renders an empty state when no dataset has anything to show', async () => {
    const fetchTableCatalog = vi.fn().mockResolvedValue([]);

    render(await TableCatalog({ fetchTableCatalog }));

    expect(
      screen.getByText(
        'No tables to show. The catalog lists the datasets that dashboard definitions reference.'
      )
    ).toBeInTheDocument();
  });

  it('renders the unavailable state and logs when the fetch fails', async () => {
    const error = new RepositoryError('Failed to fetch table catalog');
    const fetchTableCatalog = vi.fn().mockRejectedValue(error);

    render(await TableCatalog({ fetchTableCatalog }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Warehouse data unavailable'
    );
    expect(errorMock).toHaveBeenCalledWith(
      { err: error },
      'Failed to fetch table catalog'
    );
  });
});
