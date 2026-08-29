import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  type TimeSeriesBandPoint,
  TimeSeriesChart,
  type TimeSeriesChartSeries,
} from '.';

const oneHour = 60 * 60 * 1000;

function januaryDay(index: number): number {
  return Date.UTC(2026, 0, 1 + index);
}

/** Peaks just under the threshold, where curve overshoot becomes visible. */
const nearThresholdSeries: TimeSeriesChartSeries = {
  id: 'carbonDioxide',
  label: 'Carbon dioxide',
  points: [900, 990, 990, 900].map((value, index) => ({
    timestamp: januaryDay(index),
    value,
  })),
};

const thresholdValue = 1000;
const thresholds = [{ id: 'limit', value: thresholdValue }];

const completeBandPoints: TimeSeriesBandPoint[] = [
  { timestamp: januaryDay(0), low: 50, high: 60 },
  { timestamp: januaryDay(1), low: 52, high: 62 },
  { timestamp: januaryDay(2), low: 54, high: 61 },
  { timestamp: januaryDay(3), low: 51, high: 59 },
];

const halfMeasuredIndex = 2;
const halfMeasuredBandPoints: TimeSeriesBandPoint[] = completeBandPoints.map(
  (point, index) =>
    index === halfMeasuredIndex ? { ...point, low: null } : point
);

function bandSeries(points: TimeSeriesBandPoint[]): TimeSeriesChartSeries {
  return { kind: 'band', id: 'spread', label: 'Spread', points };
}

function referenceLineY(container: HTMLElement): number {
  return Number(
    container.querySelector('.recharts-reference-line line')?.getAttribute('y1')
  );
}

function seriesPathData(container: HTMLElement): string {
  return (
    container.querySelector('.recharts-line-curve')?.getAttribute('d') ?? ''
  );
}

function bandPathData(container: HTMLElement): string {
  return (
    container.querySelector('path.recharts-area-area')?.getAttribute('d') ?? ''
  );
}

function pathPointYs(pathData: string): number[] {
  return Array.from(pathData.matchAll(/[-\d.]+,(-?[\d.]+)/g), (match) =>
    Number(match[1])
  );
}

function subPathCount(pathData: string): number {
  return (pathData.match(/M/g) ?? []).length;
}

function valueAxisValues(container: HTMLElement): number[] {
  return Array.from(
    container.querySelectorAll(
      '.recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value'
    ),
    (tick) => Number(tick.textContent)
  );
}

function timeAxisLabels(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll(
      '.recharts-xAxis-tick-labels .recharts-cartesian-axis-tick-value'
    ),
    (tick) => tick.textContent ?? ''
  );
}

describe('TimeSeriesChart thresholds', () => {
  it('draws a threshold that no measurement reaches', () => {
    const { container } = render(
      <TimeSeriesChart
        label="Carbon dioxide"
        period="month"
        series={[nearThresholdSeries]}
        thresholds={thresholds}
      />
    );

    expect(
      container.querySelector('.recharts-reference-line line')
    ).not.toBeNull();
  });

  it('widens the value axis to include a threshold above every measurement', () => {
    const { container } = render(
      <TimeSeriesChart
        label="Carbon dioxide"
        period="month"
        series={[nearThresholdSeries]}
        thresholds={thresholds}
      />
    );

    expect(Math.max(...valueAxisValues(container))).toBeGreaterThanOrEqual(
      thresholdValue
    );
  });
});

describe('TimeSeriesChart interpolation', () => {
  it('keeps the default curve on the measured side of the threshold', () => {
    const { container } = render(
      <TimeSeriesChart
        label="Carbon dioxide"
        period="month"
        series={[nearThresholdSeries]}
        thresholds={thresholds}
      />
    );

    // SVG y grows downward, so staying under the threshold means a larger y.
    const roundingTolerance = 0.01;
    const lowestAllowedY = referenceLineY(container) - roundingTolerance;
    expect(
      pathPointYs(seriesPathData(container)).every(
        (pointY) => pointY >= lowestAllowedY
      )
    ).toBe(true);
  });

  it('overshoots the threshold with natural interpolation', () => {
    const { container } = render(
      <TimeSeriesChart
        label="Carbon dioxide"
        period="month"
        series={[nearThresholdSeries]}
        thresholds={thresholds}
        interpolation="natural"
      />
    );

    const pathData = seriesPathData(container);
    const cubicCommand = 'C';
    expect(pathData).toContain(cubicCommand);
    expect(
      pathPointYs(pathData).some((pointY) => pointY < referenceLineY(container))
    ).toBe(true);
  });
});

describe('TimeSeriesChart time zone', () => {
  it('labels the time axis on the wall clock of the given time zone', () => {
    const tokyoMidnight = Date.UTC(2026, 0, 14, 15);
    const tokyoDay = {
      id: 'carbonDioxide',
      label: 'Carbon dioxide',
      points: Array.from({ length: 24 }, (_, index) => ({
        timestamp: tokyoMidnight + index * oneHour,
        value: 400 + index,
      })),
    };

    const { container } = render(
      <TimeSeriesChart
        label="Carbon dioxide"
        period="day"
        series={[tokyoDay]}
        timeZone="Asia/Tokyo"
      />
    );

    const labels = timeAxisLabels(container);
    expect(labels).toContain('00:00');
    expect(labels).not.toContain('15:00');
  });
});

describe('TimeSeriesChart band series', () => {
  it.each`
    bounds               | points                    | expectedSubPaths
    ${'a half-measured'} | ${halfMeasuredBandPoints} | ${2}
    ${'only measured'}   | ${completeBandPoints}     | ${1}
  `(
    'draws $expectedSubPaths band sub-paths with $bounds point',
    ({ points, expectedSubPaths }) => {
      const { container } = render(
        <TimeSeriesChart
          label="Resting heart rate"
          period="month"
          series={[bandSeries(points)]}
        />
      );

      expect(subPathCount(bandPathData(container))).toBe(expectedSubPaths);
    }
  );

  it('leaves no unresolved coordinate in a band broken by a gap', () => {
    const { container } = render(
      <TimeSeriesChart
        label="Resting heart rate"
        period="month"
        series={[bandSeries(halfMeasuredBandPoints)]}
      />
    );

    expect(bandPathData(container)).not.toContain('NaN');
  });
});
