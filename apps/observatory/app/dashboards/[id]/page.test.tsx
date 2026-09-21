import { screen } from '@testing-library/react';
import { renderToReadableStream } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  loadDashboards: vi.fn(),
  createFetchPeriodBoundsUseCase: vi.fn(),
  createFetchSectionDataUseCase: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('not-found');
  }),
}));

vi.mock('next/navigation', () => ({ notFound: mocks.notFound }));
vi.mock('../../../infrastructure/di/dashboard', () => ({
  createLoadDashboardsUseCase: () => ({ execute: mocks.loadDashboards }),
  createFetchPeriodBoundsUseCase: mocks.createFetchPeriodBoundsUseCase,
  createFetchSectionDataUseCase: mocks.createFetchSectionDataUseCase,
}));
vi.mock('../../../modules/dashboard/adapters/shared', () => ({
  dashboardLogger: { error: vi.fn(), warn: vi.fn() },
}));

import Page from './page';

function createDashboard() {
  return {
    id: 'summary',
    title: 'Summary',
    grain: 'month' as const,
    timeZone: 'UTC',
    locale: 'en-US',
    revalidate: 86_400,
    sections: ['first', 'second'].map((id) => ({
      id,
      title: id === 'first' ? 'First' : 'Second',
      kind: 'stat-tiles' as const,
      source: {
        dataset: 'metrics',
        view: 'monthly',
        time: 'recorded_on',
      },
      tiles: [
        {
          label: 'Total',
          column: 'total',
          reduction: 'sum' as const,
          format: { type: 'number' as const },
        },
      ],
    })),
  };
}

describe('dashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns not found when the dashboard id is unknown', async () => {
    mocks.loadDashboards.mockResolvedValue({ definitions: [], issues: [] });

    const result = Page({ params: Promise.resolve({ id: 'unknown' }) });

    await expect(result).rejects.toThrow('not-found');
    expect(mocks.createFetchPeriodBoundsUseCase).not.toHaveBeenCalled();
  });

  it('renders every section as unavailable when warehouse initialization fails', async () => {
    mocks.loadDashboards.mockResolvedValue({
      definitions: [createDashboard()],
      issues: [],
    });
    mocks.createFetchPeriodBoundsUseCase.mockImplementation(() => {
      throw new Error(
        'WAREHOUSE_PROJECT_ID environment variable is required to access the warehouse'
      );
    });

    const page = await Page({ params: Promise.resolve({ id: 'summary' }) });

    const stream = await renderToReadableStream(page);
    await stream.allReady;
    document.body.innerHTML = await new Response(stream).text();

    expect(
      screen.getByRole('heading', { name: 'Summary' })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });
});
