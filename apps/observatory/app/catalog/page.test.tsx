import { screen } from '@testing-library/react';
import { renderToReadableStream } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loadDashboardsMock, fetchCatalogMock } = vi.hoisted(() => ({
  loadDashboardsMock: vi.fn(),
  fetchCatalogMock: vi.fn(),
}));

vi.mock('../../infrastructure', () => ({
  createLoadDashboardsUseCase: () => ({ execute: loadDashboardsMock }),
  createFetchTableCatalogUseCase: () => ({ execute: fetchCatalogMock }),
}));
vi.mock('../../modules/catalog/adapters/shared/logger', () => ({
  catalogLogger: { error: vi.fn() },
}));
vi.mock('../../modules/dashboard/adapters/shared', () => ({
  dashboardLogger: { warn: vi.fn() },
}));

import Page from './page';

async function renderPage() {
  const stream = await renderToReadableStream(Page());
  await stream.allReady;
  document.body.innerHTML = await new Response(stream).text();
}

describe('table catalog page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchCatalogMock.mockResolvedValue([]);
  });

  it('shows catalog rows only for datasets referenced by definitions', async () => {
    const tablesByDataset: Record<string, object[]> = {
      alpha: [
        {
          datasetId: 'alpha',
          name: 'alpha_table',
          type: 'table',
          rowCount: 1,
          sizeInBytes: 1,
          lastModifiedAt: null,
        },
      ],
      zeta: [
        {
          datasetId: 'zeta',
          name: 'zeta_table',
          type: 'table',
          rowCount: 2,
          sizeInBytes: 2,
          lastModifiedAt: null,
        },
      ],
      unrelated: [
        {
          datasetId: 'unrelated',
          name: 'unrelated_table',
          type: 'table',
          rowCount: 3,
          sizeInBytes: 3,
          lastModifiedAt: null,
        },
      ],
    };
    loadDashboardsMock.mockResolvedValue({
      definitions: [
        {
          sections: [
            { source: { dataset: 'zeta' } },
            { source: { dataset: 'alpha' } },
          ],
        },
        { sections: [{ source: { dataset: 'alpha' } }] },
      ],
      issues: [],
    });
    fetchCatalogMock.mockImplementation(async ({ datasetIds }) =>
      datasetIds.flatMap(
        (datasetId: string) => tablesByDataset[datasetId] ?? []
      )
    );

    await renderPage();

    expect(
      screen.getByRole('rowheader', { name: 'alpha_table' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('rowheader', { name: 'zeta_table' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('rowheader', { name: 'unrelated_table' })
    ).toBeNull();
    expect(screen.getAllByRole('rowheader')).toHaveLength(2);
  });

  it.each([
    {
      scenario: 'the definition source rejects',
      arrange: () =>
        loadDashboardsMock.mockRejectedValue(new Error('read failed')),
    },
    {
      scenario: 'the definition source reports an issue',
      arrange: () =>
        loadDashboardsMock.mockResolvedValue({
          definitions: [],
          issues: [
            {
              fileName: '/missing',
              path: '',
              message: 'Could not read dashboard definitions: ENOENT',
            },
          ],
        }),
    },
  ])('shows the unavailable state when $scenario', async ({ arrange }) => {
    arrange();

    await renderPage();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Warehouse data unavailable'
    );
    expect(fetchCatalogMock).not.toHaveBeenCalled();
  });
});
