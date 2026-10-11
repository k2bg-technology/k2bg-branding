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
  SeriesSlot,
  TimeSeriesSection as TimeSeriesDefinition,
} from '../../../modules/dashboard/domain';
import {
  layoutWideSeries,
  Period,
  planSection,
} from '../../../modules/dashboard/domain';
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
  rows: {
    period: string;
    value_0: number | null;
    value_1?: number | null;
    value_2?: number | null;
  }[],
  truncated = false,
  slots?: SeriesSlot[]
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
      slots={slots ?? layoutWideSeries(section.series ?? []).slots}
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

  it('ticks a 48-hour range by date', () => {
    const props = renderSeries(definition('day', 'hour', 48), '2026-08-15', [
      { period: '2026-08-15T00', value_0: 15 },
    ]);

    expect(props.period).toBe(ChartPeriod.WEEK);
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

  it('passes band gaps and reference bounds to the chart', () => {
    const dashboard = definition('day', 'day', 3);
    const section = dashboard.sections[0];
    if (section.kind !== 'time-series') throw new Error('Expected time series');
    section.series = [
      { label: 'Temperature', column: 'temperature', reduction: 'average' },
      {
        label: 'Typical range',
        low: 'temperature_low',
        high: 'temperature_high',
        reduction: 'average',
      },
    ];
    section.thresholds = [{ value: 28, label: 'Too warm' }];
    section.bands = [{ from: 18, to: 24 }];

    const props = renderSeries(dashboard, '2026-08-15', [
      { period: '2026-08-15', value_0: 20, value_1: 18, value_2: 25 },
      { period: '2026-08-14', value_0: 19, value_1: null, value_2: 24 },
    ]);

    expect(props.series[1]).toEqual({
      kind: 'band',
      id: 'series-1',
      label: 'Typical range',
      interpolation: undefined,
      points: [
        { timestamp: 1786546800000, low: null, high: null },
        { timestamp: 1786633200000, low: null, high: 24 },
        { timestamp: 1786719600000, low: 18, high: 25 },
      ],
    });
    expect(props.thresholds).toEqual([
      { id: 'threshold-0', value: 28, label: 'Too warm' },
    ]);
    expect(props.bands).toEqual([{ id: 'band-0', from: 18, to: 24 }]);
  });

  it('passes step interpolation while leaving the default undefined', () => {
    const dashboard = definition('day', 'day', 1);
    const section = dashboard.sections[0];
    if (section.kind !== 'time-series' || section.series === undefined)
      throw new Error('Expected time series');
    section.series.push({
      label: 'Heating',
      column: 'is_heating',
      reduction: 'maximum',
      interpolation: 'step',
    });

    const props = renderSeries(dashboard, '2026-08-15', [
      { period: '2026-08-15', value_0: 20, value_1: 1 },
    ]);

    expect(props.series[0].interpolation).toBeUndefined();
    expect(props.series[1].interpolation).toBe('step');
    expect(props.thresholds).toBeUndefined();
    expect(props.bands).toBeUndefined();
  });

  it('fills missing Tokyo hours for pivot slots', () => {
    const dashboard = definition('day', 'hour');
    const section = dashboard.sections[0];
    const period = Period.parse('day', '2026-08-15');
    if (section.kind !== 'time-series' || period === null)
      throw new Error('Expected time series');
    section.series = undefined;
    section.pivot = {
      column: 'room',
      value: { column: 'temperature', reduction: 'average' },
    };

    render(
      <TimeSeriesSection
        dashboard={dashboard}
        section={section}
        period={period}
        data={{
          truncated: false,
          buckets: [
            { period: '2026-08-15T00', values: [20] },
            { period: '2026-08-15T23', values: [23] },
          ],
        }}
        slots={[
          {
            kind: 'line',
            id: 'category-0',
            label: 'kitchen',
            interpolation: 'step',
            valueIndex: 0,
          },
        ]}
      />
    );
    const props = chart.mock.calls.at(-1)?.[0];
    if (props === undefined) throw new Error('Expected chart props');

    expect(props.series[0].id).toBe('category-0');
    expect(props.series[0].points).toHaveLength(24);
    expect(props.series[0].points[0]).toEqual({
      timestamp: 1786719600000,
      value: 20,
    });
    expect(props.series[0].points[5]).toEqual({
      timestamp: 1786737600000,
      value: null,
    });
    expect(props.series[0].points[23]).toEqual({
      timestamp: 1786802400000,
      value: 23,
    });
  });
});
