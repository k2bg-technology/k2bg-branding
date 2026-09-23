import { screen } from '@testing-library/react';
import { renderToReadableStream } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loadDashboardsMock } = vi.hoisted(() => ({
  loadDashboardsMock: vi.fn(),
}));

vi.mock('../infrastructure', () => ({
  createLoadDashboardsUseCase: () => ({ execute: loadDashboardsMock }),
}));

import Page from './page';

describe('dashboard index page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the dashboard index inside the page shell', async () => {
    loadDashboardsMock.mockResolvedValue({
      definitions: [
        { id: 'summary', title: 'Summary', description: 'Monthly totals' },
      ],
      issues: [],
    });

    const stream = await renderToReadableStream(Page());
    await stream.allReady;
    document.body.innerHTML = await new Response(stream).text();

    expect(
      screen.getByRole('heading', { name: 'Dashboards' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Summary' })).toHaveAttribute(
      'href',
      '/dashboards/summary'
    );
    expect(screen.getByRole('link', { name: 'Table catalog' })).toHaveAttribute(
      'href',
      '/catalog'
    );
  });
});
