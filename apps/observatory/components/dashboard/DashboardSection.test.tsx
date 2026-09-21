import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type {
  DashboardDefinition,
  DateBounds,
} from '../../modules/dashboard/domain';
import { AmbiguousLatestValueError } from '../../modules/dashboard/domain';
import { DashboardSection } from './DashboardSection';

function createDashboard(): DashboardDefinition {
  return {
    id: 'summary',
    title: 'Summary',
    grain: 'month',
    timeZone: 'UTC',
    locale: 'en-US',
    revalidate: 86_400,
    sections: [
      {
        id: 'headline',
        title: 'Headline',
        kind: 'stat-tiles',
        source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
        tiles: [
          {
            label: 'Total',
            column: 'total',
            reduction: 'sum',
            format: { type: 'number' },
          },
        ],
      },
    ],
  };
}

const bounds: DateBounds = {
  firstDate: '2026-08-01',
  lastDate: '2026-09-30',
};

describe('DashboardSection', () => {
  it('displays values from the latest month in the bounds', async () => {
    const dashboard = createDashboard();

    render(
      await DashboardSection({
        dashboard,
        section: dashboard.sections[0],
        periodBounds: Promise.resolve(bounds),
        fetchSectionData: async ({ period }) => ({
          values: [period.toString() === '2026-09' ? 9 : 8],
        }),
      })
    );

    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.queryByText('8')).not.toBeInTheDocument();
  });

  it('renders the empty state when the bounds source has no rows', async () => {
    const dashboard = createDashboard();

    render(
      await DashboardSection({
        dashboard,
        section: dashboard.sections[0],
        periodBounds: Promise.resolve(null),
        fetchSectionData: async () => ({ values: [10] }),
      })
    );

    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  it('renders the unavailable state when the shared bounds request rejects', async () => {
    const dashboard = createDashboard();

    render(
      await DashboardSection({
        dashboard,
        section: dashboard.sections[0],
        periodBounds: Promise.reject(new Error('warehouse failed')),
        fetchSectionData: async () => ({ values: [10] }),
      })
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'This section could not be loaded.'
    );
  });

  it('renders the empty state when the section query returns zero rows', async () => {
    const dashboard = createDashboard();

    render(
      await DashboardSection({
        dashboard,
        section: dashboard.sections[0],
        periodBounds: Promise.resolve(bounds),
        fetchSectionData: async () => null,
      })
    );

    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  it('renders the unavailable state when latest values are ambiguous', async () => {
    const dashboard = createDashboard();

    render(
      await DashboardSection({
        dashboard,
        section: dashboard.sections[0],
        periodBounds: Promise.resolve(bounds),
        fetchSectionData: async () =>
          Promise.reject(new AmbiguousLatestValueError('headline', 'total')),
      })
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders all-null measures as an em dash instead of zero', async () => {
    const dashboard = createDashboard();

    render(
      await DashboardSection({
        dashboard,
        section: dashboard.sections[0],
        periodBounds: Promise.resolve(bounds),
        fetchSectionData: async () => ({ values: [null] }),
      })
    );

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
