import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChartColor, DonutChart, type DonutChartSlice } from '.';

const spendingSlices: DonutChartSlice[] = [
  { id: 'housing', label: 'Housing', value: 30 },
  { id: 'food', label: 'Food', value: 20 },
  { id: 'transport', label: 'Transport', value: 10 },
];

function createSlices(count: number): DonutChartSlice[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `slice-${index}`,
    label: `Slice ${index}`,
    value: index + 1,
  }));
}

function sliceFills(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll('.recharts-sector'),
    (sector) => sector.getAttribute('fill') ?? ''
  );
}

function centerElement(container: HTMLElement): Element | null {
  return container.querySelector('[data-slot="donut-chart-center"]');
}

function tooltipText(container: HTMLElement): string {
  return (
    container.querySelector('[data-slot="chart-tooltip"]')?.textContent ?? ''
  );
}

function hoverFirstSlice(container: HTMLElement): void {
  fireEvent.mouseOver(container.querySelectorAll('.recharts-sector')[0]);
}

describe('DonutChart', () => {
  it('names the chart surface with the label', () => {
    const label = 'Spending by category in January 2026';

    render(<DonutChart label={label} slices={spendingSlices} />);

    expect(
      screen.getByRole('application', { name: label })
    ).toBeInTheDocument();
  });

  it('draws one sector per slice', () => {
    const { container } = render(
      <DonutChart label="Spending" slices={spendingSlices} />
    );

    expect(container.querySelectorAll('.recharts-sector')).toHaveLength(
      spendingSlices.length
    );
  });

  it('fills the slices with the palette in order', () => {
    const { container } = render(
      <DonutChart label="Spending" slices={spendingSlices} />
    );

    expect(sliceFills(container)).toEqual([
      'var(--color-chart-1)',
      'var(--color-chart-2)',
      'var(--color-chart-3)',
    ]);
  });

  it('fills a slice with its own color instead of the palette one', () => {
    const slices = spendingSlices.map((slice, index) =>
      index === 0 ? { ...slice, color: ChartColor.ERROR } : slice
    );

    const { container } = render(
      <DonutChart label="Spending" slices={slices} />
    );

    expect(sliceFills(container)[0]).toBe('var(--color-error)');
  });

  it('shows the center value and the center label in the hole', () => {
    const centerValue = '¥60,000';
    const centerLabel = 'per month';

    const { container } = render(
      <DonutChart
        label="Spending"
        slices={spendingSlices}
        centerValue={centerValue}
        centerLabel={centerLabel}
      />
    );

    expect(centerElement(container)?.textContent).toBe(
      `${centerValue}${centerLabel}`
    );
  });

  it.each`
    centerValue  | centerLabel    | expectCenter
    ${'¥60,000'} | ${'per month'} | ${true}
    ${'¥60,000'} | ${undefined}   | ${true}
    ${undefined} | ${'per month'} | ${true}
    ${undefined} | ${undefined}   | ${false}
  `(
    'renders the center: $expectCenter for centerValue=$centerValue and centerLabel=$centerLabel',
    ({ centerValue, centerLabel, expectCenter }) => {
      const { container } = render(
        <DonutChart
          label="Spending"
          slices={spendingSlices}
          centerValue={centerValue}
          centerLabel={centerLabel}
        />
      );

      expect(centerElement(container) !== null).toBe(expectCenter);
    }
  );

  it.each`
    sliceCount | showLegend   | expectLegend
    ${1}       | ${undefined} | ${false}
    ${2}       | ${undefined} | ${true}
    ${1}       | ${true}      | ${true}
    ${2}       | ${false}     | ${false}
  `(
    'renders the legend: $expectLegend for $sliceCount slices with showLegend=$showLegend',
    ({ sliceCount, showLegend, expectLegend }) => {
      render(
        <DonutChart
          label="Spending"
          slices={createSlices(sliceCount)}
          showLegend={showLegend}
        />
      );

      expect(screen.queryByRole('list') !== null).toBe(expectLegend);
    }
  );

  it('lists every slice label in the legend', () => {
    render(<DonutChart label="Spending" slices={spendingSlices} />);

    const legendItems = screen.getAllByRole('listitem');
    expect(legendItems.map((item) => item.textContent)).toEqual([
      'Housing',
      'Food',
      'Transport',
    ]);
  });

  it('names the hovered slice by its label', () => {
    const { container } = render(
      <DonutChart label="Spending" slices={spendingSlices} />
    );

    hoverFirstSlice(container);

    expect(tooltipText(container)).toContain('Housing');
  });

  it('shows the share of the total for the hovered slice', () => {
    const { container } = render(
      <DonutChart label="Spending" slices={spendingSlices} />
    );

    hoverFirstSlice(container);

    const housingShare = '50%';
    expect(tooltipText(container)).toContain(housingShare);
  });

  it('formats the hovered slice value with valueFormatter', () => {
    const valueFormatter = (value: number) => `¥${value},000`;

    const { container } = render(
      <DonutChart
        label="Spending"
        slices={spendingSlices}
        valueFormatter={valueFormatter}
      />
    );

    hoverFirstSlice(container);

    expect(tooltipText(container)).toContain('¥30,000');
  });
});
