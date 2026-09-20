import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { BarChart, type BarSeries } from '.';

const weekdayCategories = ['Mon', 'Tue', 'Wed'];
const missingValueLabel = '—';
const chartMarginLeft = 12;
/** Menlo, the first font of the brand stack, advances 0.60205em at the 12px caption. */
const tickCharacterWidth = 7.23;

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

/** Tick labels end at the axis width, so their anchor measures the room they get. */
function valueAxisLabelRoom(container: HTMLElement): number {
  const anchor = container.querySelector(
    '.recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value'
  );
  return Number(anchor?.getAttribute('x')) - chartMarginLeft;
}

/** Bars come out series by series, so the first slice is the first series. */
function barLeftEdges(container: HTMLElement): number[] {
  return Array.from(
    container.querySelectorAll('.recharts-bar-rectangle path'),
    (bar) => Number(bar.getAttribute('x'))
  );
}

function barOutlines(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll('.recharts-bar-rectangle path'),
    (bar) => bar.getAttribute('d') ?? ''
  );
}

/** A bar below the baseline grows downwards, so its edges come back ordered. */
function barEdges(
  container: HTMLElement
): Array<{ top: number; bottom: number }> {
  return Array.from(
    container.querySelectorAll('.recharts-bar-rectangle path'),
    (bar) => {
      const start = Number(bar.getAttribute('y'));
      const end = start + Number(bar.getAttribute('height'));
      return { top: Math.min(start, end), bottom: Math.max(start, end) };
    }
  );
}

function baselinePosition(container: HTMLElement): number {
  return Number(
    container.querySelector('.recharts-reference-line line')?.getAttribute('y1')
  );
}

function tooltipText(container: HTMLElement): string {
  return (
    container.querySelector('[data-slot="chart-tooltip"]')?.textContent ?? ''
  );
}

function firstBarLeftEdge(chart: ReactElement): number {
  const { container } = render(chart);
  return barLeftEdges(container)[0] ?? 0;
}

function createTwoSeries(): BarSeries[] {
  return [
    createSeries(),
    createSeries({ id: 'water', label: 'Water', values: [3, 4, 5] }),
  ];
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

  it('draws one bar per category for every series when stacked', () => {
    const series = createTwoSeries();

    const { container } = render(
      <BarChart
        label="Usage"
        categories={weekdayCategories}
        series={series}
        stacked
      />
    );

    expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(
      weekdayCategories.length * series.length
    );
  });

  it.each`
    stacked  | sharesColumn
    ${true}  | ${true}
    ${false} | ${false}
  `(
    'places the bars of a category on one column: $sharesColumn when stacked=$stacked',
    ({ stacked, sharesColumn }) => {
      const { container } = render(
        <BarChart
          label="Usage"
          categories={weekdayCategories}
          series={createTwoSeries()}
          stacked={stacked}
        />
      );

      const leftEdges = barLeftEdges(container);
      const secondSeriesEdges = leftEdges.slice(weekdayCategories.length);
      expect(
        leftEdges
          .slice(0, weekdayCategories.length)
          .every((edge, index) => edge === secondSeriesEdges[index])
      ).toBe(sharesColumn);
    }
  );

  it('rounds only the topmost bar of a stack', () => {
    const { container } = render(
      <BarChart
        label="Usage"
        categories={weekdayCategories}
        series={createTwoSeries()}
        stacked
      />
    );

    const arcCommand = 'A';
    const outlines = barOutlines(container);
    expect(
      outlines
        .slice(0, weekdayCategories.length)
        .some((outline) => outline.includes(arcCommand))
    ).toBe(false);
    expect(
      outlines
        .slice(weekdayCategories.length)
        .every((outline) => outline.includes(arcCommand))
    ).toBe(true);
  });

  it.each`
    dataset         | values
    ${'positive'}   | ${[12, 11, 13]}
    ${'negative'}   | ${[-12, -11, -13]}
    ${'mixed sign'} | ${[12, -4, 7]}
    ${'zero only'}  | ${[0, 0, 0]}
  `('labels zero on the value axis for $dataset values', ({ values }) => {
    const { container } = render(
      <BarChart
        label="Net energy"
        categories={weekdayCategories}
        series={[createSeries({ values })]}
      />
    );

    expect(valueAxisLabels(container)).toContain('0');
  });

  it('draws a bar for every category when all values are negative', () => {
    const { container } = render(
      <BarChart
        label="Net energy"
        categories={weekdayCategories}
        series={[createSeries({ values: [-12, -11, -13] })]}
      />
    );

    expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(
      weekdayCategories.length
    );
  });

  it('hangs a negative bar below the zero baseline', () => {
    const categories = ['Mon', 'Tue'];

    const { container } = render(
      <BarChart
        label="Net energy"
        categories={categories}
        series={[createSeries({ values: [6, -4] })]}
      />
    );

    const [positiveBar, negativeBar] = barEdges(container);
    const baseline = baselinePosition(container);
    expect(positiveBar?.bottom).toBeCloseTo(baseline);
    expect(negativeBar?.top).toBeCloseTo(baseline);
    expect(negativeBar?.bottom).toBeGreaterThan(baseline);
  });

  it.each`
    values          | expectBaseline
    ${[12, 11, 13]} | ${false}
    ${[12, -4, 7]}  | ${true}
  `(
    'draws the zero baseline: $expectBaseline for $values',
    ({ values, expectBaseline }) => {
      const { container } = render(
        <BarChart
          label="Net energy"
          categories={weekdayCategories}
          series={[createSeries({ values })]}
        />
      );

      expect(container.querySelector('.recharts-reference-line') !== null).toBe(
        expectBaseline
      );
    }
  );

  it('stacks negative values below the baseline and positive ones above it', () => {
    const categories = ['Mon', 'Tue'];
    const series = [
      createSeries({ id: 'inflow', label: 'Inflow', values: [8, 5] }),
      createSeries({ id: 'outflow', label: 'Outflow', values: [-3, -6] }),
    ];

    const { container } = render(
      <BarChart
        label="Net energy"
        categories={categories}
        series={series}
        stacked
      />
    );

    const edges = barEdges(container);
    const baseline = baselinePosition(container);
    expect(
      edges.slice(0, categories.length).every((edge) => edge.bottom <= baseline)
    ).toBe(true);
    expect(
      edges.slice(categories.length).every((edge) => edge.top >= baseline)
    ).toBe(true);
  });

  it('skips the bar of a category whose value is null', () => {
    const { container } = render(
      <BarChart
        label="Energy"
        categories={weekdayCategories}
        series={[createSeries({ values: [12, null, 13] })]}
      />
    );

    const expectedBarCount = 2;
    expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(
      expectedBarCount
    );
  });

  it('shows an em dash in the tooltip for a category without a value', async () => {
    const user = userEvent.setup();
    const series = [
      createSeries(),
      createSeries({ id: 'water', label: 'Water', values: [3, null, 5] }),
    ];
    const { container } = render(
      <BarChart label="Usage" categories={weekdayCategories} series={series} />
    );

    await user.tab();
    await user.keyboard('{ArrowRight}');

    expect(tooltipText(container)).toBe(`TueEnergy11Water${missingValueLabel}`);
  });

  it('shows the em dash for the only series of a category without a value', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <BarChart
        label="Energy"
        categories={weekdayCategories}
        series={[createSeries({ values: [12, null, 13] })]}
      />
    );

    await user.tab();
    await user.keyboard('{ArrowRight}');

    expect(tooltipText(container)).toBe(`TueEnergy${missingValueLabel}`);
  });

  it('answers with an em dash per series for a category missing everywhere', async () => {
    const user = userEvent.setup();
    const series = [
      createSeries({ values: [12, null, 13] }),
      createSeries({ id: 'water', label: 'Water', values: [3, null, 5] }),
    ];
    const { container } = render(
      <BarChart label="Usage" categories={weekdayCategories} series={series} />
    );

    await user.tab();
    await user.keyboard('{ArrowRight}');

    expect(tooltipText(container)).toBe(
      `TueEnergy${missingValueLabel}Water${missingValueLabel}`
    );
  });

  it('formats a measured zero in the tooltip', async () => {
    const user = userEvent.setup();
    const series = [
      createSeries(),
      createSeries({ id: 'water', label: 'Water', values: [3, 0, 5] }),
    ];
    const { container } = render(
      <BarChart
        label="Usage"
        categories={weekdayCategories}
        series={series}
        valueFormatter={(value) => `${value} L`}
      />
    );

    await user.tab();
    await user.keyboard('{ArrowRight}');

    expect(tooltipText(container)).toBe('TueEnergy11 LWater0 L');
  });

  it('formats the value axis with axisValueFormatter', () => {
    const { container } = render(
      <BarChart
        label="Energy"
        categories={weekdayCategories}
        series={[createSeries()]}
        valueFormatter={(value) => `${value} kWh`}
        axisValueFormatter={(value) => `${value}k`}
      />
    );

    const labels = valueAxisLabels(container);
    expect(labels.length).toBeGreaterThan(0);
    expect(labels.every((label) => label.endsWith('k'))).toBe(true);
  });

  it('keeps valueFormatter for the tooltip when axisValueFormatter is set', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <BarChart
        label="Energy"
        categories={weekdayCategories}
        series={[createSeries()]}
        valueFormatter={(value) => `${value} kWh`}
        axisValueFormatter={(value) => `${value}k`}
      />
    );

    await user.tab();
    await user.keyboard('{ArrowRight}');

    expect(tooltipText(container)).toBe('TueEnergy11 kWh');
  });

  it('gives the value axis room for long tick labels', () => {
    const longLabelEdge = firstBarLeftEdge(
      <BarChart
        label="Energy"
        categories={weekdayCategories}
        series={[createSeries({ values: [1200000, 900000, 1500000] })]}
        valueFormatter={(value) => `${value.toLocaleString('en-US')} kWh`}
      />
    );

    const shortLabelEdge = firstBarLeftEdge(
      <BarChart
        label="Energy"
        categories={weekdayCategories}
        series={[createSeries()]}
      />
    );

    expect(longLabelEdge).toBeGreaterThan(shortLabelEdge);
  });

  it('fits the widest tick label in the value axis', () => {
    const formatValue = (value: number) =>
      `${value.toLocaleString('en-US')} Wh`;
    const largestValue = 1500000;

    const { container } = render(
      <BarChart
        label="Energy"
        categories={weekdayCategories}
        series={[createSeries({ values: [largestValue, 900000, 1200000] })]}
        valueFormatter={formatValue}
      />
    );

    expect(valueAxisLabelRoom(container)).toBeGreaterThanOrEqual(
      formatValue(largestValue).length * tickCharacterWidth
    );
  });

  it('keeps the value axis at its minimum width for short tick labels', () => {
    const singleDigit = render(
      <BarChart
        label="Energy"
        categories={weekdayCategories}
        series={[createSeries({ values: [6, 7, 8] })]}
      />
    );

    const twoDigits = render(
      <BarChart
        label="Energy"
        categories={weekdayCategories}
        series={[createSeries()]}
      />
    );

    expect(valueAxisLabelRoom(singleDigit.container)).toBe(
      valueAxisLabelRoom(twoDigits.container)
    );
  });
});
