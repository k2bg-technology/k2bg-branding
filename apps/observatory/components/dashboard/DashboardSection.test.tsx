import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../modules/dashboard/adapters/shared', () => ({
  dashboardLogger: { error: vi.fn(), warn: vi.fn() },
}));

import { toSectionData } from '../../modules/dashboard/adapters/output/query-services/warehouse/mapper';
import type { DashboardDefinition } from '../../modules/dashboard/domain';
import {
  AmbiguousLatestValueError,
  Period,
  planSection,
} from '../../modules/dashboard/domain';
import type {
  DashboardPeriodResolution,
  SectionData,
} from '../../modules/dashboard/use-cases';
import { DashboardSection } from './DashboardSection';

function dashboard(locale = 'en-US'): DashboardDefinition {
  return {
    id: 'summary',
    title: 'Summary',
    grain: 'month',
    timeZone: 'UTC',
    locale,
    revalidate: 86_400,
    defaultPeriod: 'latest-with-data',
    periodSource: { dataset: 'metrics', view: 'bounds', time: 'recorded_on' },
    sections: [
      {
        id: 'headline',
        title: 'Headline',
        kind: 'stat-tiles',
        source: { dataset: 'metrics', view: 'values', time: 'recorded_on' },
        tiles: [
          {
            label: 'Total',
            column: 'total',
            reduction: 'sum',
            format: { type: 'number' },
            comparison: { direction: 'higher-is-better' },
          },
          {
            label: 'Latest',
            column: 'latest',
            reduction: 'latest',
            format: { type: 'number' },
          },
        ],
      },
    ],
  };
}

function resolution(month: string): DashboardPeriodResolution {
  const period = Period.parse(month);
  if (period === null) {
    throw new Error('Expected fixture period to parse');
  }
  return {
    period,
    bounds: { firstDate: '2026-08-01', lastDate: '2026-09-30' },
    previousTarget: null,
    nextTarget: null,
  };
}

function data(): SectionData {
  return {
    buckets: [
      { period: '2026-07', values: [100, null] },
      { period: '2026-08', values: [120, 9] },
    ],
  };
}

describe('DashboardSection', () => {
  it('shows an own-source previous-month delta even when period bounds start later', async () => {
    const definition = dashboard();

    render(
      await DashboardSection({
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-08')),
        fetchSectionData: async () => data(),
      })
    );

    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('+20%')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('keeps a mixed section ready when only a non-comparing previous value is ambiguous', async () => {
    const definition = dashboard();
    const selected = resolution('2026-08');
    const mapped = toSectionData(
      [
        { period: '2026-07', value_0: 100, value_1: 7, distinct_count_1: 2 },
        { period: '2026-08', value_0: 120, value_1: 9, distinct_count_1: 1 },
      ],
      planSection(definition.sections[0], selected.period, definition.timeZone)
    );

    render(
      await DashboardSection({
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(selected),
        fetchSectionData: async () => mapped,
      })
    );

    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('+20%')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('queries and shows an outside-bounds month when its section has a bucket', async () => {
    const definition = dashboard();

    render(
      await DashboardSection({
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-07')),
        fetchSectionData: async () => data(),
      })
    );

    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('uses locale for the delta text', async () => {
    const definition = dashboard('de-DE');

    render(
      await DashboardSection({
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-08')),
        fetchSectionData: async () => data(),
      })
    );

    expect(screen.getByText(/\+20\s%/)).toBeInTheDocument();
  });

  it('shows empty when the selected month has no bucket', async () => {
    const definition = dashboard();

    render(
      await DashboardSection({
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-09')),
        fetchSectionData: async () => data(),
      })
    );

    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  it('shows empty without reading the section when there is no default period', async () => {
    const definition = dashboard();
    const fetchSectionData = vi.fn(async () => data());

    render(
      await DashboardSection({
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(null),
        fetchSectionData,
      })
    );

    expect(screen.getByText('No data available.')).toBeInTheDocument();
    expect(fetchSectionData).not.toHaveBeenCalled();
  });

  it('shows unavailable when period resolution rejects', async () => {
    const definition = dashboard();

    render(
      await DashboardSection({
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.reject(new Error('warehouse failed')),
        fetchSectionData: async () => data(),
      })
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'This section could not be loaded.'
    );
  });

  it('shows unavailable when a selected-month latest value is ambiguous', async () => {
    const definition = dashboard();

    render(
      await DashboardSection({
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-08')),
        fetchSectionData: async () =>
          Promise.reject(new AmbiguousLatestValueError('headline', 'latest')),
      })
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows an em dash for a null selected value', async () => {
    const definition = dashboard();

    render(
      await DashboardSection({
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-08')),
        fetchSectionData: async () => ({
          buckets: [{ period: '2026-08', values: [null, 9] }],
        }),
      })
    );

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText('+0%')).not.toBeInTheDocument();
  });

  it('formats an absolute signed delta when the prior value is zero', async () => {
    const definition = dashboard();

    render(
      await DashboardSection({
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-08')),
        fetchSectionData: async () => ({
          buckets: [
            { period: '2026-07', values: [0, null] },
            { period: '2026-08', values: [5, 9] },
          ],
        }),
      })
    );

    expect(screen.getByText('+5')).toBeInTheDocument();
  });
});
