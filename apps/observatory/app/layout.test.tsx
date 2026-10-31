import { renderToReadableStream } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loadDashboardsMock } = vi.hoisted(() => ({
  loadDashboardsMock: vi.fn(),
}));

vi.mock('next/server', () => ({
  connection: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../infrastructure', () => ({
  createLoadDashboardsUseCase: () => ({ execute: loadDashboardsMock }),
}));
vi.mock('../modules/dashboard/adapters/shared', () => ({
  dashboardLogger: { error: vi.fn() },
}));

import RootLayout from './layout';

describe('root layout', () => {
  beforeEach(() => vi.clearAllMocks());

  it('includes loaded dashboard links between the fixed links', async () => {
    loadDashboardsMock.mockResolvedValue({
      definitions: [{ id: 'summary', title: 'Summary' }],
      issues: [],
    });

    const stream = await renderToReadableStream(
      RootLayout({
        children: <p>Page content</p>,
        params: Promise.resolve({}),
      })
    );
    await stream.allReady;
    const markup = await new Response(stream).text();

    expect(markup).toContain('href="/dashboards/summary"');
    expect(markup.indexOf('Overview')).toBeLessThan(markup.indexOf('Summary'));
    expect(markup.indexOf('Summary')).toBeLessThan(
      markup.indexOf('Table catalog')
    );
  });

  it('renders fixed navigation and children when definition loading fails', async () => {
    loadDashboardsMock.mockRejectedValue(new Error('read failed'));

    const stream = await renderToReadableStream(
      RootLayout({
        children: <p>Page content</p>,
        params: Promise.resolve({}),
      })
    );
    await stream.allReady;
    const markup = await new Response(stream).text();

    expect(markup).toContain('Overview');
    expect(markup).toContain('Table catalog');
    expect(markup).toContain('Page content');
  });
});
