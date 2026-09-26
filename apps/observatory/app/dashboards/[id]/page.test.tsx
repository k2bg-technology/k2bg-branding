import { screen } from '@testing-library/react';
import { renderToReadableStream } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  loadDashboards: vi.fn(),
  resolvePeriod: vi.fn(),
  fetchSectionData: vi.fn(),
  createResolveDashboardPeriodUseCase: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('not-found');
  }),
}));

vi.mock('next/navigation', () => ({ notFound: mocks.notFound }));
vi.mock('../../../infrastructure/di/dashboard', () => ({
  createLoadDashboardsUseCase: () => ({ execute: mocks.loadDashboards }),
  createResolveDashboardPeriodUseCase:
    mocks.createResolveDashboardPeriodUseCase,
  createFetchSectionDataUseCase: () => ({ execute: mocks.fetchSectionData }),
}));
vi.mock('../../../modules/dashboard/adapters/shared', () => ({
  dashboardLogger: { error: vi.fn(), warn: vi.fn() },
}));

import { Period } from '../../../modules/dashboard/domain';
import Page from './page';

function dashboard(locale = 'en-US') {
  return {
    id: 'summary',
    title: 'Summary',
    grain: 'month' as const,
    timeZone: 'UTC',
    locale,
    revalidate: 86_400,
    defaultPeriod: 'latest-with-data' as const,
    sections: ['first', 'second'].map((id) => ({
      id,
      title: id === 'first' ? 'First' : 'Second',
      kind: 'stat-tiles' as const,
      source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
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

async function renderPage(
  searchParameters: Record<string, string | string[]> = {}
) {
  const page = await Page({
    params: Promise.resolve({ id: 'summary' }),
    searchParams: Promise.resolve(searchParameters),
  });
  const stream = await renderToReadableStream(page);
  await stream.allReady;
  document.body.innerHTML = await new Response(stream).text();
}

describe('dashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.loadDashboards.mockResolvedValue({
      definitions: [dashboard()],
      issues: [],
    });
    mocks.createResolveDashboardPeriodUseCase.mockReturnValue({
      execute: mocks.resolvePeriod,
    });
    mocks.resolvePeriod.mockImplementation(async ({ requestedPeriod }) => {
      const period = requestedPeriod ?? Period.parse('2026-09');
      return {
        period,
        bounds: { firstDate: '2026-08-01', lastDate: '2026-09-30' },
        previousTarget: Period.parse('2026-08'),
        nextTarget: null,
      };
    });
    mocks.fetchSectionData.mockImplementation(async ({ period }) => ({
      buckets: [
        {
          period: period.toString(),
          values: [period.toString() === '2026-08' ? 8 : 9],
        },
      ],
    }));
  });

  it('returns not found for an unknown dashboard id', async () => {
    mocks.loadDashboards.mockResolvedValue({ definitions: [], issues: [] });

    await expect(
      Page({
        params: Promise.resolve({ id: 'unknown' }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow('not-found');
    expect(mocks.createResolveDashboardPeriodUseCase).not.toHaveBeenCalled();
  });

  it('rejects invalid URL state before initializing the warehouse', async () => {
    await expect(
      Page({
        params: Promise.resolve({ id: 'summary' }),
        searchParams: Promise.resolve({ period: '2026-13' }),
      })
    ).rejects.toThrow('not-found');

    expect(mocks.createResolveDashboardPeriodUseCase).not.toHaveBeenCalled();
    expect(mocks.fetchSectionData).not.toHaveBeenCalled();
  });

  it('shows a locale-formatted month and preserves foreign parameters in navigation', async () => {
    await renderPage({
      period: '2026-09',
      note: 'kept&safe',
      'page.first': '2',
    });

    expect(screen.getByText('September 2026')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Previous period' })
    ).toHaveAttribute('href', '?period=2026-08&note=kept%26safe');
  });

  it('formats the month and navigation labels from the dashboard definition', async () => {
    mocks.loadDashboards.mockResolvedValue({
      definitions: [
        {
          ...dashboard('en-US-u-ca-buddhist'),
          labels: {
            period: 'Review month',
            previousPeriod: 'Earlier month',
            nextPeriod: 'Later month',
          },
        },
      ],
      issues: [],
    });

    await renderPage({ period: '2026-09' });

    expect(screen.getByText('September 2569 BE')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Earlier month' })
    ).toBeInTheDocument();
  });

  it('resolves the period once and queries every section for the requested month', async () => {
    await renderPage({ period: '2026-08' });

    expect(mocks.resolvePeriod).toHaveBeenCalledTimes(1);
    expect(mocks.fetchSectionData).toHaveBeenCalledTimes(2);
    expect(
      mocks.fetchSectionData.mock.calls.map(([input]) =>
        input.period.toString()
      )
    ).toEqual(['2026-08', '2026-08']);
    expect(screen.getAllByText('8')).toHaveLength(2);
  });

  it('shows unavailable sections when period resolution rejects', async () => {
    mocks.resolvePeriod.mockRejectedValue(new Error('warehouse failed'));

    await renderPage();

    expect(screen.getAllByRole('alert')).toHaveLength(2);
    expect(screen.getByText('Period')).toBeInTheDocument();
  });

  it('renders unavailable sections and disables navigation when warehouse initialization throws', async () => {
    mocks.createResolveDashboardPeriodUseCase.mockImplementation(() => {
      throw new Error('WAREHOUSE_PROJECT_ID is required');
    });

    await renderPage();

    expect(
      screen.getByRole('heading', { name: 'Summary' })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(2);
    expect(screen.getByText('Period')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Previous period' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Next period' })).toBeNull();
  });
});
