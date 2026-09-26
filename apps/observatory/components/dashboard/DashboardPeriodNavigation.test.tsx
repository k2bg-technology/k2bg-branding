import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../modules/dashboard/adapters/shared', () => ({
  dashboardLogger: { error: vi.fn(), warn: vi.fn() },
}));

import type { DashboardDefinition } from '../../modules/dashboard/domain';
import { Period } from '../../modules/dashboard/domain';
import { DashboardPeriodNavigation } from './DashboardPeriodNavigation';

function dashboard(): DashboardDefinition {
  return {
    id: 'summary',
    title: 'Summary',
    grain: 'month',
    timeZone: 'UTC',
    locale: 'en-US',
    revalidate: 86_400,
    defaultPeriod: 'latest-with-data',
    sections: [],
  };
}

describe('DashboardPeriodNavigation', () => {
  it('keeps the requested month as a disabled label when period resolution rejects', async () => {
    const period = Period.parse('2026-08');
    if (period === null) {
      throw new Error('Expected fixture period to parse');
    }

    render(
      await DashboardPeriodNavigation({
        dashboard: dashboard(),
        state: { period, controls: {}, pages: {}, foreign: [] },
        periodResolution: Promise.reject(new Error('warehouse failed')),
      })
    );

    expect(screen.getByText('August 2026')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
