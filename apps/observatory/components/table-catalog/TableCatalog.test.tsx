import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RepositoryError } from '../../modules/catalog/adapters';
import type { TableSummaryOutput } from '../../modules/catalog/use-cases';
import { TableCatalog } from './TableCatalog';

const { errorMock } = vi.hoisted(() => ({ errorMock: vi.fn() }));

vi.mock('../../modules/catalog/adapters/shared/logger', () => ({
  catalogLogger: { error: errorMock },
}));

function createTableSummaryOutput(
  overrides: Partial<TableSummaryOutput> = {}
): TableSummaryOutput {
  return {
    datasetId: 'finance',
    name: 'transactions',
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
        name: 'accounts',
        rowCount: 12,
        sizeInBytes: 512,
        lastModifiedAt: '2026-07-15T09:30:00.000Z',
      }),
      createTableSummaryOutput({
        datasetId: 'health',
        name: 'steps',
        lastModifiedAt: null,
      }),
    ];
    const fetchTableCatalog = vi.fn().mockResolvedValue(tables);

    render(await TableCatalog({ fetchTableCatalog }));

    expect(
      screen.getByRole('rowheader', { name: 'accounts' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('rowheader', { name: 'steps' })
    ).toBeInTheDocument();
    expect(screen.getByText('finance')).toBeInTheDocument();
    expect(screen.getByText('health')).toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('64.0 KB')).toBeInTheDocument();
    expect(screen.getByText('2026-07-15')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders an empty state when the warehouse has no tables', async () => {
    const fetchTableCatalog = vi.fn().mockResolvedValue([]);

    render(await TableCatalog({ fetchTableCatalog }));

    expect(
      screen.getByText('The warehouse has no tables yet.')
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
