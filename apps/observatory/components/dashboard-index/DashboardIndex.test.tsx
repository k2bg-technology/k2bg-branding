import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { errorMock } = vi.hoisted(() => ({ errorMock: vi.fn() }));

vi.mock('../../modules/dashboard/adapters/shared', () => ({
  dashboardLogger: { error: errorMock },
}));

import { DashboardIndex } from './DashboardIndex';

describe('DashboardIndex', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists dashboards with links and descriptions and shows definition issues', async () => {
    const loadDashboards = vi.fn().mockResolvedValue({
      definitions: [
        { id: 'summary', title: 'Summary', description: 'Monthly totals' },
      ],
      issues: [
        {
          fileName: 'invalid.json',
          path: 'sections.0.kind',
          message: 'Unknown kind',
        },
        { fileName: 'broken.json', path: '', message: 'Invalid JSON' },
      ],
    });

    render(await DashboardIndex({ loadDashboards }));

    expect(screen.getByRole('link', { name: 'Summary' })).toHaveAttribute(
      'href',
      '/dashboards/summary'
    );
    expect(screen.getByText('Monthly totals')).toBeInTheDocument();
    expect(
      screen.getByText('invalid.json — sections.0.kind — Unknown kind')
    ).toBeInTheDocument();
    expect(screen.getByText('broken.json — Invalid JSON')).toBeInTheDocument();
  });

  it('shows an empty message without an issues section when no definitions exist', async () => {
    const loadDashboards = vi.fn().mockResolvedValue({
      definitions: [],
      issues: [],
    });

    render(await DashboardIndex({ loadDashboards }));

    expect(
      screen.getByText('No dashboard definitions were found.')
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Definition issues' })
    ).not.toBeInTheDocument();
  });

  it('shows an inline unavailable state and logs when definition loading fails', async () => {
    const error = new Error('read failed');
    const loadDashboards = vi.fn().mockRejectedValue(error);

    render(await DashboardIndex({ loadDashboards }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Dashboards unavailable'
    );
    expect(errorMock).toHaveBeenCalledWith(
      { err: error },
      'Failed to load dashboards'
    );
  });
});
