import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BarChart, type BarSeries } from '.';

const weekdayCategories = ['Mon', 'Tue', 'Wed'];

function createSeries(overrides: Partial<BarSeries> = {}): BarSeries {
  return {
    id: 'energy',
    label: 'Energy',
    values: [12, 11, 13],
    ...overrides,
  };
}

function categoryAxisLabels(container: HTMLElement): string[] {
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

describe('BarChart', () => {
  it('names the chart surface with the label', () => {
    const label = 'Energy consumption per day of week';

    render(
      <BarChart
        label={label}
        categories={weekdayCategories}
        series={[createSeries()]}
      />
    );

    expect(
      screen.getByRole('application', { name: label })
    ).toBeInTheDocument();
  });

  it('labels the category axis in the given order', () => {
    const { container } = render(
      <BarChart
        label="Energy"
        categories={weekdayCategories}
        series={[createSeries()]}
      />
    );

    expect(categoryAxisLabels(container)).toEqual(weekdayCategories);
  });

  it('draws one bar per category for every series', () => {
    const series = [
      createSeries(),
      createSeries({ id: 'water', label: 'Water', values: [3, 4, 5] }),
    ];

    const { container } = render(
      <BarChart label="Usage" categories={weekdayCategories} series={series} />
    );

    expect(container.querySelectorAll('.recharts-bar')).toHaveLength(
      series.length
    );
    expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(
      weekdayCategories.length * series.length
    );
  });

  it('skips bars for categories without a value', () => {
    const series = [createSeries({ values: [12, 11] })];

    const { container } = render(
      <BarChart label="Energy" categories={weekdayCategories} series={series} />
    );

    const expectedBarCount = 2;
    expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(
      expectedBarCount
    );
  });

  it('keeps the category labels when a series id is "category"', () => {
    const series = [createSeries({ id: 'category' })];

    const { container } = render(
      <BarChart label="Energy" categories={weekdayCategories} series={series} />
    );

    expect(categoryAxisLabels(container)).toEqual(weekdayCategories);
  });

  it('formats the value axis with valueFormatter', () => {
    const valueFormatter = (value: number) => `${value} kWh`;

    const { container } = render(
      <BarChart
        label="Energy"
        categories={weekdayCategories}
        series={[createSeries()]}
        valueFormatter={valueFormatter}
      />
    );

    const labels = valueAxisLabels(container);
    expect(labels.length).toBeGreaterThan(0);
    expect(labels.every((label) => label.endsWith(' kWh'))).toBe(true);
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
        <BarChart
          label="Usage"
          categories={weekdayCategories}
          series={series}
          showLegend={showLegend}
        />
      );

      expect(screen.queryByRole('list') !== null).toBe(expectLegend);
    }
  );
});
