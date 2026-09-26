import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../modules/dashboard/adapters/shared', () => ({
  dashboardLogger: { error: vi.fn(), warn: vi.fn() },
}));

import type { DashboardDefinition } from '../../modules/dashboard/domain';
import { Period } from '../../modules/dashboard/domain';
import { DashboardPeriodNavigation } from './DashboardPeriodNavigation';

function month(value: string): Period {
  const period = Period.parse(value);
  if (period === null) {
    throw new Error('Expected fixture period to parse');
  }
  return period;
}

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
  it.each([
    {
      direction: 'previous',
      previousTarget: '2026-07',
      nextTarget: null,
      linkName: 'Previous period',
      missingLinkName: 'Next period',
      expectedHref: '?period=2026-07',
    },
    {
      direction: 'next',
      previousTarget: null,
      nextTarget: '2026-09',
      linkName: 'Next period',
      missingLinkName: 'Previous period',
      expectedHref: '?period=2026-09',
    },
  ])(
    'links only the $direction target month from the resolved period',
    async ({
      previousTarget,
      nextTarget,
      linkName,
      missingLinkName,
      expectedHref,
    }) => {
      render(
        await DashboardPeriodNavigation({
          dashboard: dashboard(),
          state: { period: null, controls: {}, pages: {}, foreign: [] },
          periodResolution: Promise.resolve({
            period: month('2026-08'),
            bounds: { firstDate: '2026-07-01', lastDate: '2026-09-30' },
            previousTarget:
              previousTarget === null ? null : month(previousTarget),
            nextTarget: nextTarget === null ? null : month(nextTarget),
          }),
        })
      );

      expect(screen.getByText('August 2026')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: linkName })).toHaveAttribute(
        'href',
        expectedHref
      );
      expect(
        screen.queryByRole('link', { name: missingLinkName })
      ).not.toBeInTheDocument();
    }
  );

  it('keeps the requested month as a disabled label when period resolution rejects', async () => {
    const period = month('2026-08');

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
