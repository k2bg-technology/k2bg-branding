import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChartColor, Sparkline } from '.';

const viewBoxSize = 100;

const temperatures = [19.8, 20.1, 20.4];

function polylines(container: HTMLElement): SVGPolylineElement[] {
  return Array.from(container.querySelectorAll('polyline'));
}

function pointCoordinates(polyline: Element): { x: number; y: number }[] {
  return (polyline.getAttribute('points') ?? '').split(' ').map((pair) => {
    const [x, y] = pair.split(',').map(Number);
    return { x, y };
  });
}

describe('Sparkline', () => {
  it('names the chart surface with the label', () => {
    const label = 'Living room temperature over the last 14 days';

    render(<Sparkline label={label} values={temperatures} />);

    expect(screen.getByRole('img', { name: label })).toBeInTheDocument();
  });

  it.each`
    shape                             | values                      | expectedRuns
    ${'an unbroken series'}           | ${[1, 2, 3]}                | ${1}
    ${'a series split by one gap'}    | ${[1, 2, null, 3, 4]}       | ${2}
    ${'a series fenced by gaps'}      | ${[null, 1, null, 2, null]} | ${2}
    ${'a series split by two gaps'}   | ${[1, null, null, 2]}       | ${2}
    ${'a series without measurement'} | ${[null, null]}             | ${0}
  `('draws $expectedRuns polylines for $shape', ({ values, expectedRuns }) => {
    const { container } = render(
      <Sparkline label="Temperature" values={values} />
    );

    expect(polylines(container)).toHaveLength(expectedRuns);
  });

  it('repeats the point of a lone measurement so its round cap renders a dot', () => {
    const loneMeasurement = [null, 20.4, null];
    const repeatedPointCount = 2;

    const { container } = render(
      <Sparkline label="Temperature" values={loneMeasurement} />
    );

    const [polyline] = polylines(container);
    const points = pointCoordinates(polyline);
    expect(points).toHaveLength(repeatedPointCount);
    expect(points[0]).toEqual(points[1]);
    expect(polyline.getAttribute('stroke-linecap')).toBe('round');
  });

  it('spans the full width of the view box', () => {
    const firstX = 0;

    const { container } = render(
      <Sparkline label="Temperature" values={temperatures} />
    );

    const points = pointCoordinates(polylines(container)[0]);
    expect(points[0].x).toBe(firstX);
    expect(points[points.length - 1].x).toBe(viewBoxSize);
  });

  it('draws the largest value above the smallest', () => {
    const risingValues = [19.8, 21.4];

    const { container } = render(
      <Sparkline label="Temperature" values={risingValues} />
    );

    // SVG y grows downward, so the larger value sits at the smaller y.
    const [lowest, highest] = pointCoordinates(polylines(container)[0]);
    expect(highest.y).toBeLessThan(lowest.y);
  });

  it('fills its box by stretching the view box', () => {
    render(<Sparkline label="Temperature" values={temperatures} />);

    const chart = screen.getByRole('img');
    expect(chart.getAttribute('viewBox')).toBe(
      `0 0 ${viewBoxSize} ${viewBoxSize}`
    );
    expect(chart.getAttribute('preserveAspectRatio')).toBe('none');
  });

  it('keeps every stroke undistorted by the stretch', () => {
    const gappedValues = [1, 2, null, 3, 4];

    const { container } = render(
      <Sparkline label="Temperature" values={gappedValues} />
    );

    const vectorEffects = polylines(container).map((polyline) =>
      polyline.getAttribute('vector-effect')
    );
    expect(vectorEffects).toEqual(['non-scaling-stroke', 'non-scaling-stroke']);
  });

  it.each`
    color                 | expected
    ${undefined}          | ${'var(--color-chart-1)'}
    ${ChartColor.CHART_2} | ${'var(--color-chart-2)'}
    ${ChartColor.ERROR}   | ${'var(--color-error)'}
  `(
    'strokes the line with $expected for color $color',
    ({ color, expected }) => {
      const { container } = render(
        <Sparkline label="Temperature" values={temperatures} color={color} />
      );

      expect(polylines(container)[0].getAttribute('stroke')).toBe(expected);
    }
  );
});
