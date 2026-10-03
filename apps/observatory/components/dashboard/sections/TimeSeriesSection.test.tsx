import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const chart = vi.hoisted(() =>
  vi.fn(
    (_props: React.ComponentProps<typeof import('ui').TimeSeriesChart>) => null
  )
);
vi.mock('ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('ui')>()),
  TimeSeriesChart: chart,
}));

import { ChartPeriod } from 'ui';
import { toSectionData } from '../../../modules/dashboard/adapters/output/query-services/warehouse/mapper';
import type {
  DashboardDefinition,
  TimeSeriesSection as TimeSeriesDefinition,
} from '../../../modules/dashboard/domain';
import { Period, planSection } from '../../../modules/dashboard/domain';
import { TimeSeriesSection } from './TimeSeriesSection';

function definition(
  grain: DashboardDefinition['grain'],
  sectionGrain: TimeSeriesDefinition['grain'],
  window?: number
) {
  const dashboard: DashboardDefinition = {
    id: 'readings',
    title: 'Readings',
    grain,
    timeZone: 'Asia/Tokyo',
    locale: 'en-US',
    revalidate: 86_400,
    defaultPeriod: 'latest-with-data',
    labels: { truncated: 'Older buckets are hidden' },
    sections: [
      {
        id: 'trend',
        title: 'Temperature trend',
        kind: 'time-series',
        source: {
          dataset: 'home',
          view: 'readings',
          time: { date: 'reading_date', hour: 'reading_hour' },
        },
        grain: sectionGrain,
        window,
        variant: 'line',
        stacked: false,
        format: { type: 'number' },
        series: [
          { label: 'Temperature', column: 'temperature', reduction: 'average' },
        ],
      },
    ],
  };
  return dashboard;
}

function renderSeries(
  dashboard: DashboardDefinition,
  selected: string,
  rows: { period: string; value_0: number }[],
  truncated = false
) {
  const period = Period.parse(dashboard.grain, selected);
  const section = dashboard.sections[0];
  if (period === null || section.kind !== 'time-series') {
    throw new Error('Expected time-series period');
  }
  const plan = planSection(section, period, dashboard.timeZone);
  if (plan.kind !== 'time-series') {
    throw new Error('Expected time-series plan');
  }
  const data = toSectionData(rows, {
    ...plan,
    bucketLimit: truncated ? 1 : 120,
  });
  if (data === null) {
    throw new Error('Expected section data');
  }

  render(
    <TimeSeriesSection
      dashboard={dashboard}
      section={section}
      period={period}
      data={data}
    />
  );
  const props = chart.mock.calls.at(-1)?.[0];
  if (props === undefined) {
    throw new Error('Expected chart props');
  }
  return props;
}

beforeEach(() => chart.mockClear());

describe('TimeSeriesSection', () => {
  it('passes Tokyo hour instants and the dashboard zone to the chart', () => {
    const props = renderSeries(definition('day', 'hour'), '2026-08-15', [
      { period: '2026-08-15T23', value_0: 23 },
      { period: '2026-08-15T00', value_0: 0 },
    ]);

    expect(props.timeZone).toBe('Asia/Tokyo');
    expect(props.period).toBe(ChartPeriod.DAY);
    expect(props.series[0].points[0]).toEqual({
      timestamp: 1786719600000,
      value: 0,
    });
    expect(props.series[0].points.at(-1)).toEqual({
      timestamp: 1786802400000,
      value: 23,
    });
    expect(screen.getByText('Aug 15, 2026')).toBeInTheDocument();
  });

  it('shows a 48-hour range with local midnights on both dates', () => {
    const props = renderSeries(definition('day', 'hour', 48), '2026-08-15', [
      { period: '2026-08-15T00', value_0: 15 },
      { period: '2026-08-14T00', value_0: 14 },
    ]);

    expect(props.series[0].points).toHaveLength(48);
    expect(props.series[0].points[0]).toEqual({
      timestamp: 1786633200000,
      value: 14,
    });
    expect(props.series[0].points[24]).toEqual({
      timestamp: 1786719600000,
      value: 15,
    });
    expect(screen.getByText(/Aug 14/).textContent).toBe('Aug 14 – 15, 2026');
  });

  it.each([
    { window: 7, chartPeriod: ChartPeriod.WEEK },
    { window: 8, chartPeriod: ChartPeriod.MONTH },
    { window: 32, chartPeriod: ChartPeriod.QUARTER },
  ])('uses $chartPeriod for a $window-day span', ({ window, chartPeriod }) => {
    const props = renderSeries(definition('month', 'day', window), '2026-08', [
      { period: '2026-08-31', value_0: 31 },
    ]);

    expect(props.period).toBe(chartPeriod);
    expect(props.series[0].points.at(-1)).toEqual({
      timestamp: 1788102000000,
      value: 31,
    });
  });

  it('labels the retained date after truncation', () => {
    renderSeries(
      definition('day', 'hour', 48),
      '2026-08-15',
      [
        { period: '2026-08-15T23', value_0: 23 },
        { period: '2026-08-15T03', value_0: 3 },
      ],
      true
    );

    expect(
      screen.getByText('Aug 15, 2026 · Older buckets are hidden')
    ).toBeInTheDocument();
  });
});
