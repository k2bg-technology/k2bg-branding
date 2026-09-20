import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  type TimeSeriesBandPoint,
  TimeSeriesChart,
  type TimeSeriesChartSeries,
  type TimeSeriesSeries,
} from '.';

const oneHour = 60 * 60 * 1000;

function januaryDay(index: number): number {
  return Date.UTC(2026, 0, 1 + index);
}

function januaryPoints(values: (number | null)[]): TimeSeriesSeries['points'] {
  return values.map((value, index) => ({
    timestamp: januaryDay(index),
    value,
  }));
}

function hourlySeries(hourCount: number): TimeSeriesSeries {
  return {
    id: 'carbonDioxide',
    label: 'Carbon dioxide',
    points: Array.from({ length: hourCount }, (_, index) => ({
      timestamp: januaryDay(0) + index * oneHour,
      value: 400 + index,
    })),
  };
}

/** Its second point is unmeasured, so the stack there is the other series alone. */
const partiallyMeasuredSeries: TimeSeriesSeries = {
  id: 'kitchen',
  label: 'Kitchen',
  points: januaryPoints([30, null, 20]),
};

const measuredSeries: TimeSeriesSeries = {
  id: 'office',
  label: 'Office',
  points: januaryPoints([10, 30, 20]),
};

const stackableSeries = [partiallyMeasuredSeries, measuredSeries];
const expectedStackTops = [40, 30, 40];

const stackedChartBandPoints: TimeSeriesBandPoint[] = [
  { timestamp: januaryDay(0), low: 50, high: 60 },
  { timestamp: januaryDay(1), low: 52, high: 62 },
  { timestamp: januaryDay(2), low: 54, high: 61 },
];
/** Recharts closes a band path along its high edge and back along its low one. */
const expectedBandEdges = [60, 62, 61, 54, 52, 50];

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

const areaCurve = 'path.recharts-area-curve';
const lineCurve = 'path.recharts-line-curve';

function curvePathData(container: HTMLElement, selector: string): string[] {
  return Array.from(
    container.querySelectorAll(selector),
    (curve) => curve.getAttribute('d') ?? ''
  );
}

/** Recharts draws in pixels; the value axis reads those pixels back as values. */
function curveValues(container: HTMLElement, pathData: string): number[] {
  const ticks = Array.from(
    container.querySelectorAll(
      '.recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value'
    ),
    (tick) => ({
      value: Number(tick.textContent),
      pixel: Number(tick.getAttribute('y')),
    })
  );
  const lowest = ticks[0];
  const highest = ticks[ticks.length - 1];
  const valuesPerPixel =
    (highest.value - lowest.value) / (highest.pixel - lowest.pixel);
  return pathPointYs(pathData).map((pixel) =>
    Math.round(lowest.value + (pixel - lowest.pixel) * valuesPerPixel)
  );
}

function tooltipHeading(container: HTMLElement): string {
  return (
    container.querySelector('[data-slot="chart-tooltip"] p')?.textContent ?? ''
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

  it('keeps a band on its own bounds while the other series stack', () => {
    const { container } = render(
      <TimeSeriesChart
        label="Resting heart rate"
        period="month"
        variant="area"
        stacked
        series={[bandSeries(stackedChartBandPoints), ...stackableSeries]}
      />
    );

    expect(curveValues(container, bandPathData(container))).toEqual(
      expectedBandEdges
    );
  });
});

describe('TimeSeriesChart stacking', () => {
  it('tops the stack at the sum of the series measured at that time', () => {
    const { container } = render(
      <TimeSeriesChart
        label="Power draw per room"
        period="month"
        variant="area"
        stacked
        series={stackableSeries}
      />
    );

    const [, topOfStack] = curvePathData(container, areaCurve);
    expect(curveValues(container, topOfStack)).toEqual(expectedStackTops);
  });

  it.each`
    measurements   | curveIndex | expectedSubPaths
    ${'a missing'} | ${0}       | ${2}
    ${'only'}      | ${1}       | ${1}
  `(
    'draws $expectedSubPaths sub-paths for the series with $measurements measurement',
    ({ curveIndex, expectedSubPaths }) => {
      const { container } = render(
        <TimeSeriesChart
          label="Power draw per room"
          period="month"
          variant="area"
          stacked
          series={stackableSeries}
        />
      );

      expect(
        subPathCount(curvePathData(container, areaCurve)[curveIndex])
      ).toBe(expectedSubPaths);
    }
  );

  it('draws the line variant unstacked even when stacking is asked for', () => {
    const { container } = render(
      <TimeSeriesChart
        label="Power draw per room"
        period="month"
        stacked
        series={stackableSeries}
      />
    );

    const [, secondLine] = curvePathData(container, lineCurve);
    expect(curveValues(container, secondLine)).toEqual(
      measuredSeries.points.map((point) => point.value)
    );
  });
});

describe('TimeSeriesChart locale', () => {
  it('labels the time axis in the given locale', () => {
    const { container } = render(
      <TimeSeriesChart
        label="Power draw"
        period="month"
        locale="en-GB"
        series={[measuredSeries]}
      />
    );

    expect(timeAxisLabels(container)).toEqual(['01/01', '02/01', '03/01']);
  });

  it('keeps the locale-neutral labels when no locale is given', () => {
    const { container } = render(
      <TimeSeriesChart
        label="Power draw"
        period="month"
        series={[measuredSeries]}
      />
    );

    expect(timeAxisLabels(container)).toEqual(['1/1', '1/2', '1/3']);
  });
});

describe('TimeSeriesChart tooltip heading', () => {
  const hoursInOneDay = 24;
  const hoursInTwoDays = 48;

  it.each`
    sampling                  | series                            | period     | expectedHeading
    ${'hourly over a day'}    | ${[hourlySeries(hoursInOneDay)]}  | ${'day'}   | ${'01:00'}
    ${'hourly over a day'}    | ${[hourlySeries(hoursInOneDay)]}  | ${'month'} | ${'01:00'}
    ${'hourly over two days'} | ${[hourlySeries(hoursInTwoDays)]} | ${'day'}   | ${'1/1 01:00'}
    ${'hourly over two days'} | ${[hourlySeries(hoursInTwoDays)]} | ${'week'}  | ${'1/1 01:00'}
    ${'hourly over two days'} | ${[hourlySeries(hoursInTwoDays)]} | ${'month'} | ${'1/1 01:00'}
    ${'daily'}                | ${[measuredSeries]}               | ${'month'} | ${'1/2'}
    ${'daily'}                | ${[measuredSeries]}               | ${'week'}  | ${'1/2'}
  `(
    'heads the tooltip of $sampling readings under $period with $expectedHeading',
    async ({ series, period, expectedHeading }) => {
      const user = userEvent.setup();
      const { container } = render(
        <TimeSeriesChart
          label="Carbon dioxide"
          period={period}
          series={series}
        />
      );

      await user.tab();
      await user.keyboard('{ArrowRight}');

      expect(tooltipHeading(container)).toBe(expectedHeading);
    }
  );

  it.each`
    period     | expectedTicks
    ${'day'}   | ${['00:00', '08:00', '16:00', '00:00', '08:00', '16:00']}
    ${'month'} | ${['1/1', '1/2']}
  `(
    'leaves the $period ticks coarse while the heading carries the date',
    async ({ period, expectedTicks }) => {
      const user = userEvent.setup();
      const { container } = render(
        <TimeSeriesChart
          label="Carbon dioxide"
          period={period}
          series={[hourlySeries(hoursInTwoDays)]}
        />
      );

      await user.tab();
      await user.keyboard('{ArrowRight}');

      expect(timeAxisLabels(container)).toEqual(expectedTicks);
      expect(tooltipHeading(container)).toBe('1/1 01:00');
    }
  );

  it.each`
    period
    ${'day'}
    ${'week'}
    ${'month'}
  `('heads a dated $period tooltip in the given locale', async ({ period }) => {
    const user = userEvent.setup();
    const { container } = render(
      <TimeSeriesChart
        label="Carbon dioxide"
        period={period}
        locale="en-GB"
        series={[hourlySeries(hoursInTwoDays)]}
      />
    );

    await user.tab();
    await user.keyboard('{ArrowRight}');

    expect(tooltipHeading(container)).toContain('01/01');
    expect(tooltipHeading(container)).toContain('01:00');
  });

  it('keeps rendering with a locale the runtime cannot use', async () => {
    const user = userEvent.setup();
    const unusableLocale = 'not a locale';
    const { container } = render(
      <TimeSeriesChart
        label="Carbon dioxide"
        period="day"
        locale={unusableLocale}
        series={[hourlySeries(hoursInTwoDays)]}
      />
    );

    await user.tab();
    await user.keyboard('{ArrowRight}');

    expect(tooltipHeading(container)).toBe('1/1 01:00');
  });
});
