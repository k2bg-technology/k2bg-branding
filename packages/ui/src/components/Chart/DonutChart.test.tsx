import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChartColor, DonutChart, type DonutChartSlice } from '.';

const spendingSlices: DonutChartSlice[] = [
  { id: 'housing', label: 'Housing', value: 30 },
  { id: 'food', label: 'Food', value: 20 },
  { id: 'transport', label: 'Transport', value: 10 },
];

const longCenterValue = '¥1,234,567';

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

function centerValueElement(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>(
    '[data-slot="donut-chart-center-value"]'
  );
}

function centerLabelElement(container: HTMLElement): Element | null {
  return container.querySelector('[data-slot="donut-chart-center-label"]');
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

  it('sizes the center against the ring rather than the viewport', () => {
    const { container } = render(
      <DonutChart
        label="Spending"
        slices={spendingSlices}
        centerValue="¥60,000"
        centerLabel="per month"
      />
    );

    expect(centerElement(container)).toHaveClass('[container-type:size]');
  });

  it('scales the center value between a legible minimum and the heading size', () => {
    const { container } = render(
      <DonutChart
        label="Spending"
        slices={spendingSlices}
        centerValue="¥60,000"
      />
    );

    expect(centerValueElement(container)).toHaveClass(
      'text-[clamp(0.75rem,calc(52cqmin/var(--donut-center-advance)),var(--text-heading-2))]'
    );
  });

  // The budget is the advance of the glyphs actually present: a half-width
  // character counts as 0.62em, a full-width or CJK one as a whole em.
  it.each`
    width            | centerValue               | advance
    ${'half-width'}  | ${'¥1,234,567'}           | ${'6.2'}
    ${'full-width'}  | ${'１２３４５６７８９円'} | ${'10'}
    ${'mixed-width'} | ${'1,234万円'}            | ${'5.1'}
  `(
    'budgets $advance em of font size for a $width center value',
    ({ centerValue, advance }) => {
      const { container } = render(
        <DonutChart
          label="Spending"
          slices={spendingSlices}
          centerValue={centerValue}
        />
      );

      expect(
        centerValueElement(container)?.style.getPropertyValue(
          '--donut-center-advance'
        )
      ).toBe(advance);
    }
  );

  it.each`
    part       | elementOf
    ${'value'} | ${centerValueElement}
    ${'label'} | ${centerLabelElement}
  `(
    'bounds the center $part to the ring hole without breaking a word',
    ({ elementOf }) => {
      const { container } = render(
        <DonutChart
          label="Spending"
          slices={spendingSlices}
          centerValue={longCenterValue}
          centerLabel="total this year"
        />
      );

      expect(elementOf(container)).toHaveClass('max-w-[56cqmin]');
      expect(elementOf(container)).not.toHaveClass('break-words');
    }
  );

  it('keeps a long center value complete in the accessible text', () => {
    render(
      <DonutChart
        label="Spending"
        slices={spendingSlices}
        centerValue={longCenterValue}
      />
    );

    expect(screen.getByText(longCenterValue)).toBeInTheDocument();
  });

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
