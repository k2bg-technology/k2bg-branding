import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  TimeSeriesChart,
  type TimeSeriesChartProps,
  type TimeSeriesSeries,
} from '.';

function createSeries(
  overrides: Partial<TimeSeriesSeries> = {}
): TimeSeriesSeries {
  return {
    id: 'livingRoom',
    label: 'Living room',
    points: [
      { timestamp: Date.UTC(2026, 0, 1), value: 20 },
      { timestamp: Date.UTC(2026, 0, 2), value: 21 },
    ],
    ...overrides,
  };
}

function timeAxisLabels(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll(
      '.recharts-xAxis-tick-labels .recharts-cartesian-axis-tick-value'
    ),
    (tick) => tick.textContent ?? ''
  );
}

const chartMarginLeft = 12;
/** Menlo, the first font of the brand stack, advances 0.60205em at the 12px caption. */
const tickCharacterWidth = 7.23;

function formatYen(value: number) {
  return `¥${value.toLocaleString('en-US')}`;
}

/** Tick labels end at the axis width, so their anchor measures the room they get. */
function valueAxisLabelRoom(container: HTMLElement) {
  const anchor = container.querySelector(
    '.recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value'
  );
  return Number(anchor?.getAttribute('x')) - chartMarginLeft;
}

function valueAxisLabels(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll(
      '.recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value'
    ),
    (tick) => tick.textContent ?? ''
  );
}

describe('TimeSeriesChart', () => {
  it('names the chart surface with the label', () => {
    const label = 'Room temperature over January 2026';

    render(
      <TimeSeriesChart label={label} period="month" series={[createSeries()]} />
    );

    expect(
      screen.getByRole('application', { name: label })
    ).toBeInTheDocument();
  });

  it('draws one line per series', () => {
    const series = [
      createSeries(),
      createSeries({ id: 'bedroom', label: 'Bedroom' }),
    ];

    const { container } = render(
      <TimeSeriesChart label="Temperature" period="month" series={series} />
    );

    expect(container.querySelectorAll('.recharts-line')).toHaveLength(
      series.length
    );
  });

  it('draws areas instead of lines for the area variant', () => {
    const { container } = render(
      <TimeSeriesChart
        label="Temperature"
        period="month"
        series={[createSeries()]}
        variant="area"
      />
    );

    expect(container.querySelectorAll('.recharts-area')).toHaveLength(1);
    expect(container.querySelectorAll('.recharts-line')).toHaveLength(0);
  });

  it('merges the timestamps of every series onto one time axis', () => {
    const series = [
      createSeries({
        points: [{ timestamp: Date.UTC(2026, 0, 1), value: 20 }],
      }),
      createSeries({
        id: 'bedroom',
        label: 'Bedroom',
        points: [{ timestamp: Date.UTC(2026, 0, 3), value: 18 }],
      }),
    ];

    const { container } = render(
      <TimeSeriesChart label="Temperature" period="month" series={series} />
    );

    expect(timeAxisLabels(container)).toEqual(['1/1', '1/3']);
  });

  it('keeps the time axis intact when a series id is "timestamp"', () => {
    const series = [createSeries({ id: 'timestamp' })];

    const { container } = render(
      <TimeSeriesChart label="Temperature" period="month" series={series} />
    );

    expect(timeAxisLabels(container)).toEqual(['1/1', '1/2']);
  });

  it.each`
    variant
    ${'line'}
    ${'area'}
  `(
    'marks measurements isolated by gaps in the $variant variant',
    ({ variant }) => {
      const series = [
        createSeries({
          points: [
            { timestamp: Date.UTC(2026, 0, 1), value: 20 },
            { timestamp: Date.UTC(2026, 0, 2), value: null },
            { timestamp: Date.UTC(2026, 0, 3), value: 21 },
            { timestamp: Date.UTC(2026, 0, 4), value: 22 },
          ],
        }),
      ];

      const { container } = render(
        <TimeSeriesChart
          label="Temperature"
          period="month"
          series={series}
          variant={variant}
        />
      );

      const isolatedPointCount = 1;
      expect(container.querySelectorAll('circle.recharts-dot')).toHaveLength(
        isolatedPointCount
      );
    }
  );

  it('formats the value axis with valueFormatter', () => {
    const valueFormatter = (value: number) => `${value}°C`;

    const { container } = render(
      <TimeSeriesChart
        label="Temperature"
        period="month"
        series={[createSeries()]}
        valueFormatter={valueFormatter}
      />
    );

    const labels = valueAxisLabels(container);
    expect(labels.length).toBeGreaterThan(0);
    expect(labels.every((label) => label.endsWith('°C'))).toBe(true);
  });

  it.each`
    seriesCount | showLegend   | expectLegend
    ${1}        | ${undefined} | ${false}
    ${2}        | ${undefined} | ${true}
    ${1}        | ${true}      | ${true}
    ${2}        | ${false}     | ${false}
  `(
    'renders the legend: $expectLegend for $seriesCount series with showLegend=$showLegend',
    ({ seriesCount, showLegend, expectLegend }) => {
      const series = Array.from({ length: seriesCount }, (_, index) =>
        createSeries({ id: `series-${index}`, label: `Series ${index}` })
      );

      render(
        <TimeSeriesChart
          label="Temperature"
          period="month"
          series={series}
          showLegend={showLegend}
        />
      );

      expect(screen.queryByRole('list') !== null).toBe(expectLegend);
    }
  );

  it('lists every series label in the legend', () => {
    const series = [
      createSeries(),
      createSeries({ id: 'bedroom', label: 'Bedroom' }),
    ];

    render(
      <TimeSeriesChart label="Temperature" period="month" series={series} />
    );

    const legendItems = screen.getAllByRole('listitem');
    expect(legendItems.map((item) => item.textContent)).toEqual([
      'Living room',
      'Bedroom',
    ]);
  });

  it('fits the widest tick label in the value axis', () => {
    const widestLabel = '¥12,345,678';

    const { container } = render(
      <TimeSeriesChart
        label="Savings"
        period="month"
        series={[
          createSeries({
            points: [
              { timestamp: Date.UTC(2026, 0, 1), value: 11_000_000 },
              { timestamp: Date.UTC(2026, 0, 2), value: 12_345_678 },
            ],
          }),
        ]}
        valueFormatter={formatYen}
      />
    );

    expect(valueAxisLabelRoom(container)).toBeGreaterThanOrEqual(
      widestLabel.length * tickCharacterWidth
    );
  });

  const halfOfTarget = [
    { timestamp: Date.UTC(2026, 0, 1), value: 6_000_000 },
    { timestamp: Date.UTC(2026, 0, 2), value: 6_000_000 },
  ];

  it.each<{
    reach: string;
    props: Pick<
      TimeSeriesChartProps,
      'series' | 'variant' | 'stacked' | 'thresholds'
    >;
  }>([
    {
      reach: 'the total of stacked areas',
      props: {
        variant: 'area',
        stacked: true,
        series: [
          createSeries({ id: 'cash', label: 'Cash', points: halfOfTarget }),
          createSeries({ id: 'stocks', label: 'Stocks', points: halfOfTarget }),
        ],
      },
    },
    {
      reach: 'a threshold above the data',
      props: {
        series: [createSeries()],
        thresholds: [{ id: 'goal', value: 12_000_000 }],
      },
    },
  ])('fits the tick label of $reach in the value axis', ({ props }) => {
    const widestLabel = '¥12,000,000';

    const { container } = render(
      <TimeSeriesChart
        label="Savings"
        period="month"
        valueFormatter={formatYen}
        {...props}
      />
    );

    expect(valueAxisLabelRoom(container)).toBeGreaterThanOrEqual(
      widestLabel.length * tickCharacterWidth
    );
  });

  it('renders a year of half-hourly readings from many series', () => {
    const halfHourMs = 1_800_000;
    const readingsPerYear = 17_520;
    const sensorCount = 8;
    const series = Array.from({ length: sensorCount }, (_, sensorIndex) =>
      createSeries({
        id: `sensor${sensorIndex}`,
        label: `Sensor ${sensorIndex}`,
        points: Array.from({ length: readingsPerYear }, (_, index) => ({
          timestamp: Date.UTC(2025, 0, 1) + index * halfHourMs,
          value: 20 + sensorIndex,
        })),
      })
    );

    render(
      <TimeSeriesChart label="Room temperature" period="year" series={series} />
    );

    expect(
      screen.getByRole('application', { name: 'Room temperature' })
    ).toBeInTheDocument();
  });
});
