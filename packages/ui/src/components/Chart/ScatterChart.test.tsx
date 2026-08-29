import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ScatterChart, type ScatterChartSeries } from '.';

function createSeries(
  overrides: Partial<ScatterChartSeries> = {}
): ScatterChartSeries {
  return {
    id: 'nights',
    label: 'Nights',
    points: [
      { x: 6, y: 62 },
      { x: 8, y: 55 },
      { x: 7, y: 58 },
    ],
    ...overrides,
  };
}

function horizontalAxisLabels(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll(
      '.recharts-xAxis-tick-labels .recharts-cartesian-axis-tick-value'
    ),
    (tick) => tick.textContent ?? ''
  );
}

function verticalAxisLabels(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll(
      '.recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value'
    ),
    (tick) => tick.textContent ?? ''
  );
}

function pointCenterXs(container: HTMLElement): number[] {
  return Array.from(container.querySelectorAll('.recharts-symbols'), (symbol) =>
    Number(symbol.getAttribute('cx'))
  );
}

function trendLineEnds(
  container: HTMLElement
): { start: number; end: number } | undefined {
  const line = container.querySelector('.recharts-reference-line-line');
  return line === null
    ? undefined
    : {
        start: Number(line.getAttribute('x1')),
        end: Number(line.getAttribute('x2')),
      };
}

function tooltipText(container: HTMLElement): string {
  return (
    container.querySelector('[data-slot="chart-tooltip"]')?.textContent ?? ''
  );
}

describe('ScatterChart', () => {
  it('names the chart surface with the label', () => {
    const label = 'Resting heart rate against sleep duration';

    render(
      <ScatterChart
        label={label}
        xLabel="Sleep hours"
        yLabel="Resting heart rate"
        series={[createSeries()]}
      />
    );

    expect(
      screen.getByRole('application', { name: label })
    ).toBeInTheDocument();
  });

  it('draws one point group per series', () => {
    const series = [
      createSeries(),
      createSeries({ id: 'naps', label: 'Naps', points: [{ x: 1, y: 70 }] }),
    ];

    const { container } = render(
      <ScatterChart
        label="Sleep"
        xLabel="Sleep hours"
        yLabel="Resting heart rate"
        series={series}
      />
    );

    expect(container.querySelectorAll('.recharts-scatter')).toHaveLength(
      series.length
    );
  });

  it('draws one symbol per point across every series', () => {
    const series = [
      createSeries(),
      createSeries({ id: 'naps', label: 'Naps', points: [{ x: 1, y: 70 }] }),
    ];

    const { container } = render(
      <ScatterChart
        label="Sleep"
        xLabel="Sleep hours"
        yLabel="Resting heart rate"
        series={series}
      />
    );

    const expectedSymbolCount = 4;
    expect(container.querySelectorAll('.recharts-symbols')).toHaveLength(
      expectedSymbolCount
    );
  });

  it('formats the horizontal axis with xValueFormatter', () => {
    const xValueFormatter = (value: number) => `${value} h`;

    const { container } = render(
      <ScatterChart
        label="Sleep"
        xLabel="Sleep hours"
        yLabel="Resting heart rate"
        series={[createSeries()]}
        xValueFormatter={xValueFormatter}
      />
    );

    const labels = horizontalAxisLabels(container);
    expect(labels.length).toBeGreaterThan(0);
    expect(labels.every((label) => label.endsWith(' h'))).toBe(true);
  });

  it('formats the vertical axis with yValueFormatter', () => {
    const yValueFormatter = (value: number) => `${value} bpm`;

    const { container } = render(
      <ScatterChart
        label="Sleep"
        xLabel="Sleep hours"
        yLabel="Resting heart rate"
        series={[createSeries()]}
        yValueFormatter={yValueFormatter}
      />
    );

    const labels = verticalAxisLabels(container);
    expect(labels.length).toBeGreaterThan(0);
    expect(labels.every((label) => label.endsWith(' bpm'))).toBe(true);
  });

  it('spans the trend line across the plotted points', () => {
    const { container } = render(
      <ScatterChart
        label="Sleep"
        xLabel="Sleep hours"
        yLabel="Resting heart rate"
        series={[createSeries()]}
        trendLine={{ slope: -3, intercept: 80 }}
      />
    );

    const pointXs = pointCenterXs(container);
    expect(trendLineEnds(container)).toEqual({
      start: Math.min(...pointXs),
      end: Math.max(...pointXs),
    });
  });

  it('draws no trend line when none is given', () => {
    const { container } = render(
      <ScatterChart
        label="Sleep"
        xLabel="Sleep hours"
        yLabel="Resting heart rate"
        series={[createSeries()]}
      />
    );

    expect(trendLineEnds(container)).toBeUndefined();
  });

  it('draws no trend line when no series has a point', () => {
    const { container } = render(
      <ScatterChart
        label="Sleep"
        xLabel="Sleep hours"
        yLabel="Resting heart rate"
        series={[createSeries({ points: [] })]}
        trendLine={{ slope: -3, intercept: 80 }}
      />
    );

    expect(trendLineEnds(container)).toBeUndefined();
  });

  it('labels the hovered point with the axis names and the formatted values', () => {
    const xLabel = 'Sleep hours';
    const yLabel = 'Resting heart rate';

    const { container } = render(
      <ScatterChart
        label="Sleep"
        xLabel={xLabel}
        yLabel={yLabel}
        series={[createSeries()]}
        xValueFormatter={(value) => `${value} h`}
        yValueFormatter={(value) => `${value} bpm`}
      />
    );

    fireEvent.mouseOver(container.querySelectorAll('.recharts-symbols')[0]);

    expect(tooltipText(container)).toBe(`Nights${xLabel}6 h${yLabel}62 bpm`);
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
        <ScatterChart
          label="Sleep"
          xLabel="Sleep hours"
          yLabel="Resting heart rate"
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
      createSeries({ id: 'naps', label: 'Naps', points: [{ x: 1, y: 70 }] }),
    ];

    render(
      <ScatterChart
        label="Sleep"
        xLabel="Sleep hours"
        yLabel="Resting heart rate"
        series={series}
      />
    );

    const legendItems = screen.getAllByRole('listitem');
    expect(legendItems.map((item) => item.textContent)).toEqual([
      'Nights',
      'Naps',
    ]);
  });
});
