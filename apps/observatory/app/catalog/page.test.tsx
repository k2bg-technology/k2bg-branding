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

  it('queries only the datasets referenced by loaded definitions', async () => {
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

    await renderPage();

    expect(fetchCatalogMock).toHaveBeenCalledWith({
      datasetIds: ['alpha', 'zeta'],
    });
    expect(
      screen.getByRole('heading', { name: 'Table catalog' })
    ).toBeInTheDocument();
  });

  it('shows the unavailable state when definitions cannot be loaded', async () => {
    loadDashboardsMock.mockRejectedValue(new Error('read failed'));

    await renderPage();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Warehouse data unavailable'
    );
    expect(fetchCatalogMock).not.toHaveBeenCalled();
  });
});
