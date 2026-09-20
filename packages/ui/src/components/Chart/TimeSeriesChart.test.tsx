import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TimeSeriesChart, type TimeSeriesSeries } from '.';

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

function timeAxisLabels(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll(
      '.recharts-xAxis-tick-labels .recharts-cartesian-axis-tick-value'
    ),
    (tick) => tick.textContent ?? ''
  );
}

function valueAxisLabels(container: HTMLElement): string[] {
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

  it('does not mark points that are part of a line segment', () => {
    const { container } = render(
      <TimeSeriesChart
        label="Temperature"
        period="month"
        series={[createSeries()]}
      />
    );

    expect(container.querySelectorAll('circle.recharts-dot')).toHaveLength(0);
  });

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
});

describe('TimeSeriesChart series style', () => {
  it.each`
    variant   | curveSelector
    ${'line'} | ${'.recharts-line-curve'}
    ${'area'} | ${'.recharts-area-curve'}
  `(
    'dashes a dashed series in the $variant variant',
    ({ variant, curveSelector }) => {
      const { container } = render(
        <TimeSeriesChart
          label="Temperature"
          period="month"
          variant={variant}
          series={[createSeries({ lineStyle: 'dashed' })]}
        />
      );

      expect(container.querySelector(curveSelector)).toHaveAttribute(
        'stroke-dasharray'
      );
    }
  );

  it.each`
    lineStyle    | expectsDashes
    ${undefined} | ${false}
    ${'solid'}   | ${false}
    ${'dashed'}  | ${true}
  `(
    'draws dashes: $expectsDashes for a $lineStyle series',
    ({ lineStyle, expectsDashes }) => {
      const { container } = render(
        <TimeSeriesChart
          label="Temperature"
          period="month"
          series={[createSeries({ lineStyle })]}
        />
      );

      expect(
        container
          .querySelector('.recharts-line-curve')
          ?.hasAttribute('stroke-dasharray')
      ).toBe(expectsDashes);
    }
  );

  it('draws the series with its own stroke width', () => {
    const strokeWidth = 4;

    const { container } = render(
      <TimeSeriesChart
        label="Temperature"
        period="month"
        series={[createSeries({ strokeWidth })]}
      />
    );

    expect(container.querySelector('.recharts-line-curve')).toHaveAttribute(
      'stroke-width',
      String(strokeWidth)
    );
  });

  it('fades the series to its own opacity', () => {
    const opacity = 0.5;

    const { container } = render(
      <TimeSeriesChart
        label="Temperature"
        period="month"
        series={[createSeries({ opacity })]}
      />
    );

    expect(container.querySelector('.recharts-line-curve')).toHaveAttribute(
      'stroke-opacity',
      String(opacity)
    );
  });

  it.each`
    lineStyle    | expectsDashedMarker
    ${undefined} | ${false}
    ${'dashed'}  | ${true}
  `(
    'marks a $lineStyle legend entry with a dashed marker: $expectsDashedMarker',
    ({ lineStyle, expectsDashedMarker }) => {
      render(
        <TimeSeriesChart
          label="Temperature"
          period="month"
          showLegend
          series={[createSeries({ lineStyle })]}
        />
      );

      expect(
        screen
          .getByRole('listitem')
          .querySelector('[data-slot="chart-legend-dash"]') !== null
      ).toBe(expectsDashedMarker);
    }
  );
});
