import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  CandlestickChart,
  type CandlestickChartProps,
  type CandlestickDatum,
  ChartColor,
  ChartPeriod,
} from '.';

const label = 'Daily measurement range';
const labels = {
  open: 'Start',
  high: 'Maximum',
  low: 'Minimum',
  close: 'End',
};
const friday = Date.UTC(2026, 0, 2);
const monday = Date.UTC(2026, 0, 5);
const tuesday = Date.UTC(2026, 0, 6);
const wednesday = Date.UTC(2026, 0, 7);

function createCandle(
  timestamp: number,
  overrides: Partial<CandlestickDatum> = {}
): CandlestickDatum {
  return {
    timestamp,
    open: 112,
    high: 120,
    low: 100,
    close: 116,
    ...overrides,
  };
}

function chart(
  candles: CandlestickDatum[],
  overrides: Partial<CandlestickChartProps> = {}
) {
  return (
    <CandlestickChart
      label={label}
      candles={candles}
      labels={labels}
      period={ChartPeriod.MONTH}
      {...overrides}
    />
  );
}

function marks(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll('[data-slot="candlestick-candle"]')
  );
}

function wickCenters(container: HTMLElement) {
  return marks(container).map((mark) =>
    Number(mark.querySelector('line')?.getAttribute('x1'))
  );
}

function axisLabels(container: HTMLElement, axis: 'x' | 'y') {
  return Array.from(
    container.querySelectorAll(
      `.recharts-${axis}Axis-tick-labels .recharts-cartesian-axis-tick-value`
    ),
    (tick) => tick.textContent
  );
}

function tooltip(container: HTMLElement) {
  return container.querySelector('[data-slot="chart-tooltip"]');
}

function tooltipHeading(container: HTMLElement) {
  return tooltip(container)?.querySelector('p')?.textContent;
}

describe('CandlestickChart', () => {
  it('names the chart surface with the label', () => {
    const sut = chart([createCandle(friday)]);

    render(sut);

    expect(
      screen.getByRole('application', { name: label })
    ).toBeInTheDocument();
  });

  it('draws one candle per complete datum', () => {
    const sut = chart([createCandle(friday), createCandle(monday)]);

    const { container } = render(sut);

    expect(marks(container)).toHaveLength(2);
  });

  it('marks up, down, and flat candles with their direction', () => {
    const sut = chart([
      createCandle(friday, { open: 110, close: 115 }),
      createCandle(monday, { open: 115, close: 110 }),
      createCandle(tuesday, { open: 110, close: 110 }),
    ]);

    const { container } = render(sut);

    expect(
      marks(container).map((mark) => mark.getAttribute('data-direction'))
    ).toEqual(['up', 'down', 'flat']);
  });

  it('preserves a hollow interior for a tiny up move and a solid body for a tiny down move', () => {
    const sut = chart([
      createCandle(friday, { open: 110, close: 110.01 }),
      createCandle(monday, { open: 110.01, close: 110 }),
    ]);

    const { container } = render(sut);

    const [upMark, downMark] = marks(container);
    const up = upMark.querySelector('rect');
    const down = downMark.querySelector('rect');
    const wick = upMark.querySelector('line');
    const wickTop = Number(wick?.getAttribute('y1'));
    const wickBottom = Number(wick?.getAttribute('y2'));
    const upHeight = Number(up?.getAttribute('height'));
    const upWidth = Number(up?.getAttribute('width'));
    const upStrokeWidth = Number(up?.getAttribute('stroke-width'));
    const upMidpoint = Number(up?.getAttribute('y')) + upHeight / 2;

    expect(up).toHaveAttribute('fill', 'var(--color-base-white)');
    expect(up).toHaveAttribute('stroke', 'var(--color-success)');
    expect(upHeight - upStrokeWidth).toBeGreaterThanOrEqual(2);
    expect(upWidth - upStrokeWidth).toBeGreaterThanOrEqual(2);
    expect((upMidpoint - wickTop) / (wickBottom - wickTop)).toBeCloseTo(
      0.49975,
      6
    );
    expect(down).toHaveAttribute('fill', 'var(--color-error)');
    expect(down).toHaveAttribute('height', '1');
  });

  it('spans the wick from high to low and the body from close to open for an up candle', () => {
    const sut = chart([
      createCandle(friday, { high: 120, close: 116, open: 112, low: 100 }),
    ]);

    const { container } = render(sut);

    const [mark] = marks(container);
    const wick = mark.querySelector('line');
    const body = mark.querySelector('rect');
    const high = Number(wick?.getAttribute('y1'));
    const low = Number(wick?.getAttribute('y2'));
    const close = Number(body?.getAttribute('y'));
    const open = close + Number(body?.getAttribute('height'));
    expect(high).toBeLessThan(close);
    expect(close).toBeLessThan(open);
    expect(open).toBeLessThan(low);
    expect((close - high) / (low - high)).toBeCloseTo(0.2);
    expect((open - high) / (low - high)).toBeCloseTo(0.4);
  });

  it('draws a neutral horizontal tick at the close of an incomplete datum', () => {
    const sut = chart([
      createCandle(friday, { high: 120, low: 100 }),
      createCandle(monday, { open: null, high: null, low: null, close: 116 }),
    ]);

    const { container } = render(sut);

    const [complete, tick] = marks(container);
    const wick = complete.querySelector('line');
    const wickTop = Number(wick?.getAttribute('y1'));
    const wickBottom = Number(wick?.getAttribute('y2'));
    const tickPosition = Number(tick.getAttribute('y1'));

    expect(tick.tagName).toBe('line');
    expect(tick).toHaveAttribute('data-direction', 'close-only');
    expect(tick).toHaveAttribute('stroke', 'var(--color-chart-overflow)');
    expect(
      Number(tick.getAttribute('x2')) - Number(tick.getAttribute('x1'))
    ).toBeGreaterThanOrEqual(1);
    expect(tick.getAttribute('y1')).toBe(tick.getAttribute('y2'));
    expect((tickPosition - wickTop) / (wickBottom - wickTop)).toBeCloseTo(0.2);
  });

  it('keeps an unmarked and silent slot for a null close', async () => {
    const user = userEvent.setup();
    const sut = chart([
      createCandle(friday),
      createCandle(monday, { close: null }),
      createCandle(tuesday),
      createCandle(wednesday),
    ]);
    const { container } = render(sut);

    await user.tab();
    await user.keyboard('{ArrowRight}');

    expect(marks(container)).toHaveLength(3);
    const [first, third, fourth] = wickCenters(container);
    expect(third - first).toBeCloseTo(2 * (fourth - third));
    expect(tooltip(container)).not.toBeInTheDocument();
  });

  it('spaces candles evenly across a weekend', () => {
    const sut = chart([
      createCandle(friday),
      createCandle(monday),
      createCandle(tuesday),
    ]);

    const { container } = render(sut);

    const [first, second, third] = wickCenters(container);
    expect(second).toBeGreaterThan(first);
    expect(second - first).toBeCloseTo(third - second);
  });

  it('sorts timestamps and uses the last datum for a repeated timestamp', () => {
    const sut = chart([
      createCandle(tuesday, { open: 110, close: 110 }),
      createCandle(monday, { open: 110, close: 115 }),
      createCandle(friday, { open: 115, close: 110 }),
      createCandle(monday, { open: null }),
    ]);

    const { container } = render(sut);

    const orderedMarks = marks(container).sort(
      (first, second) =>
        Number((first.querySelector('line') ?? first).getAttribute('x1')) -
        Number((second.querySelector('line') ?? second).getAttribute('x1'))
    );
    expect(
      orderedMarks.map((mark) => mark.getAttribute('data-direction'))
    ).toEqual(['down', 'close-only', 'flat']);
    expect(axisLabels(container, 'x')).toEqual(['1/2', '1/5', '1/6']);
  });

  it('applies an overriding color to each direction', () => {
    const sut = chart(
      [
        createCandle(friday, { open: 110, close: 115 }),
        createCandle(monday, { open: 115, close: 110 }),
      ],
      { upColor: ChartColor.ERROR, downColor: ChartColor.CHART_1 }
    );

    const { container } = render(sut);

    const [up, down] = marks(container);
    expect(up.querySelector('rect')).toHaveAttribute(
      'stroke',
      'var(--color-error)'
    );
    expect(down.querySelector('rect')).toHaveAttribute(
      'fill',
      'var(--color-chart-1)'
    );
  });

  it('shows four labelled and formatted values for the candle reached by keyboard', async () => {
    const user = userEvent.setup();
    const sut = chart(
      [
        createCandle(friday),
        createCandle(monday, { open: 113, high: 123, low: 103, close: 109 }),
      ],
      { valueFormatter: (value) => `${value} units` }
    );
    const { container } = render(sut);

    await user.tab();
    await user.keyboard('{ArrowRight}');

    expect(tooltip(container)).toHaveTextContent(
      '2026/1/5Start113 unitsMaximum123 unitsMinimum103 unitsEnd109 units'
    );
    const swatches = Array.from(
      tooltip(container)?.querySelectorAll('[aria-hidden="true"]') ?? []
    );
    expect(swatches.map((swatch) => swatch.getAttribute('style'))).toEqual([
      'background-color: var(--color-error);',
      'background-color: var(--color-error);',
      'background-color: var(--color-error);',
      'background-color: var(--color-error);',
    ]);
  });

  it('shows only the close row for a close-only candle', async () => {
    const user = userEvent.setup();
    const sut = chart([
      createCandle(friday),
      createCandle(monday, { low: null, close: 114 }),
    ]);
    const { container } = render(sut);

    await user.tab();
    await user.keyboard('{ArrowRight}');

    expect(tooltip(container)?.textContent).toBe('2026/1/5End114');
  });

  it('formats the axis and the tooltip in the requested time zone and locale', async () => {
    const user = userEvent.setup();
    const sut = chart(
      [
        createCandle(Date.UTC(2026, 0, 30, 16)),
        createCandle(Date.UTC(2026, 0, 31, 16)),
      ],
      { timeZone: 'Asia/Tokyo', locale: 'en-GB' }
    );
    const { container } = render(sut);

    await user.tab();
    await user.keyboard('{ArrowRight}');

    expect(axisLabels(container, 'x')).toEqual(['31/01', '01/02']);
    expect(tooltipHeading(container)).toBe('01/02/2026');
  });

  it('uses the axis formatter for ticks and the value formatter for hover values', async () => {
    const user = userEvent.setup();
    const sut = chart([createCandle(friday), createCandle(monday)], {
      axisValueFormatter: (value) => `~${value}`,
      valueFormatter: (value) => `${value} units`,
    });
    const { container } = render(sut);

    await user.tab();
    await user.keyboard('{ArrowRight}');

    expect(axisLabels(container, 'y')).toContain('~100');
    expect(tooltip(container)?.textContent).toBe(
      '2026/1/5Start112 unitsMaximum120 unitsMinimum100 unitsEnd116 units'
    );
  });

  it('fits the value axis to the lowest and highest measurements, including incomplete data', () => {
    const sut = chart([
      createCandle(friday, { low: 90, close: null }),
      createCandle(monday),
      createCandle(tuesday, { high: 130, open: null }),
    ]);

    const { container } = render(sut);

    const ticks = axisLabels(container, 'y');
    expect(ticks.at(0)).toBe('90');
    expect(ticks.at(-1)).toBe('130');
  });

  it('renders the named chart surface with no candles or tooltip for empty input', () => {
    const sut = chart([]);

    const { container } = render(sut);

    expect(
      screen.getByRole('application', { name: label })
    ).toBeInTheDocument();
    expect(marks(container)).toHaveLength(0);
    expect(tooltip(container)).not.toBeInTheDocument();
  });

  it('labels repeated calendar periods with distinct years at the requested granularity', async () => {
    const user = userEvent.setup();
    const candles = [
      createCandle(Date.UTC(2025, 0, 5)),
      createCandle(Date.UTC(2026, 0, 5)),
    ];
    const sut = (
      <>
        <div data-testid="year-chart">
          {chart(candles, { period: ChartPeriod.YEAR })}
        </div>
        <div data-testid="quarter-chart">
          {chart(candles, { period: ChartPeriod.QUARTER })}
        </div>
      </>
    );
    render(sut);
    const yearChart = screen.getByTestId('year-chart');
    const quarterChart = screen.getByTestId('quarter-chart');

    await user.tab();
    const firstMonthlyHeading = tooltipHeading(yearChart);
    await user.keyboard('{ArrowRight}');
    const secondMonthlyHeading = tooltipHeading(yearChart);
    await user.tab();
    const firstDailyHeading = tooltipHeading(quarterChart);
    await user.keyboard('{ArrowRight}');
    const secondDailyHeading = tooltipHeading(quarterChart);

    expect(axisLabels(yearChart, 'x')).toEqual(['2025/1', '2026/1']);
    expect([firstMonthlyHeading, secondMonthlyHeading]).toEqual([
      '2025/1',
      '2026/1',
    ]);
    expect([firstDailyHeading, secondDailyHeading]).toEqual([
      '2025/1/5',
      '2026/1/5',
    ]);
  });
});
