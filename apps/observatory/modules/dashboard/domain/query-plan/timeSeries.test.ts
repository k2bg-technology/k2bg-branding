import { describe, expect, it } from 'vitest';

import type { TimeSeriesSection } from '../definition';
import { Period } from '../period';
import {
  layoutWideSeries,
  planPivotRebaseBase,
  planTimeSeriesPivot,
  planTimeSeriesSection,
  planWideRebaseBase,
  rebaseBaseDate,
  warmUpLookback,
} from './timeSeries';

function pivotSection(): TimeSeriesSection {
  return {
    id: 'by-room',
    title: 'By room',
    kind: 'time-series',
    source: {
      dataset: 'home',
      view: 'readings',
      time: { date: 'reading_date', hour: 'reading_hour' },
    },
    grain: 'hour',
    window: 30,
    variant: 'line',
    stacked: false,
    format: { type: 'number' },
    pivot: {
      column: 'room',
      value: { column: 'temperature', reduction: 'average' },
    },
  };
}

describe('time-series query plans', () => {
  it('lays out measurements and two-bound bands in declaration order', () => {
    expect(
      layoutWideSeries([
        { label: 'A', column: 'a', reduction: 'average' },
        { label: 'R', low: 'lo', high: 'hi', reduction: 'maximum' },
        { label: 'S', column: 's', reduction: 'sum', interpolation: 'step' },
      ])
    ).toEqual({
      measures: [
        { column: 'a', reduction: 'average', transform: undefined },
        { column: 'lo', reduction: 'maximum' },
        { column: 'hi', reduction: 'maximum' },
        { column: 's', reduction: 'sum', transform: undefined },
      ],
      slots: [
        {
          kind: 'line',
          id: 'series-0',
          label: 'A',
          interpolation: undefined,
          valueIndex: 0,
        },
        {
          kind: 'band',
          id: 'series-1',
          label: 'R',
          interpolation: undefined,
          lowIndex: 1,
          highIndex: 2,
        },
        {
          kind: 'line',
          id: 'series-2',
          label: 'S',
          interpolation: 'step',
          valueIndex: 3,
        },
      ],
    });
    expect(layoutWideSeries([])).toEqual({ measures: [], slots: [] });
  });

  it('plans a 30-hour pivot with the first-hour bound', () => {
    const section = pivotSection();
    const period = Period.parse('day', '2026-08-15');
    if (period === null) throw new Error('Expected day');

    expect(planTimeSeriesPivot(section, period, 'Asia/Tokyo')).toEqual({
      sectionId: 'by-room',
      source: section.source,
      timeZone: 'Asia/Tokyo',
      dateRange: { firstDate: '2026-08-14', lastDate: '2026-08-15' },
      measures: [{ column: 'temperature', reduction: 'average' }],
      buckets: { grain: 'hour', firstHour: 18, bucketLimit: 120 },
      category: { column: 'room', sortKey: null },
    });
  });

  it('plans a month pivot without an hour bound', () => {
    const section = pivotSection();
    section.grain = undefined;
    section.window = 12;
    const period = Period.parse('month', '2026-08');
    if (period === null) throw new Error('Expected month');

    expect(planTimeSeriesPivot(section, period, 'Asia/Tokyo')).toEqual({
      sectionId: 'by-room',
      source: section.source,
      timeZone: 'Asia/Tokyo',
      dateRange: { firstDate: '2025-09-01', lastDate: '2026-08-31' },
      measures: [{ column: 'temperature', reduction: 'average' }],
      buckets: { grain: 'month', bucketLimit: 120 },
      category: { column: 'room', sortKey: null },
    });
  });

  it('requires a pivot binding', () => {
    const section = pivotSection();
    section.pivot = undefined;
    const period = Period.parse('day', '2026-08-15');
    if (period === null) throw new Error('Expected day');

    expect(() => planTimeSeriesPivot(section, period, 'Asia/Tokyo')).toThrow(
      'A time-series pivot requires pivot'
    );
  });
});

function smoothedSection() {
  return {
    id: 'daily-smoothed',
    title: 'Daily readings, smoothed',
    kind: 'time-series',
    grain: 'day',
    source: {
      dataset: 'sample_dataset',
      view: 'daily_readings',
      time: { date: 'reading_date', hour: 'reading_hour' },
    },
    variant: 'line',
    stacked: false,
    format: { type: 'number' },
    unit: '°C',
    series: [
      {
        label: 'Temperature',
        column: 'temperature',
        reduction: 'average',
        movingAverage: { window: 7, label: '7-day average', minimumPoints: 4 },
      },
    ],
  } satisfies TimeSeriesSection;
}

function rebasedSection() {
  return {
    id: 'rebased-balances',
    title: 'Balances indexed to 31 January 2026',
    kind: 'time-series',
    source: {
      dataset: 'sample_dataset',
      view: 'monthly_summary',
      time: { column: 'recorded_at', type: 'timestamp' },
    },
    window: 12,
    variant: 'line',
    stacked: false,
    format: { type: 'number' },
    series: [
      {
        label: 'First measure',
        column: 'first_value',
        reduction: 'latest',
        normalize: { kind: 'rebase', base: { date: '2026-01-31' } },
      },
      {
        label: 'Second measure',
        column: 'second_value',
        reduction: 'latest',
        normalize: { kind: 'rebase', base: { date: '2026-01-31' } },
      },
    ],
  } satisfies TimeSeriesSection;
}

describe('derived time-series plans', () => {
  it.each([
    { windows: [3, 7], expected: 6 },
    { windows: [], expected: 0 },
  ])('reads the largest warm-up among $windows', ({ windows, expected }) => {
    const sut = warmUpLookback;
    const section = {
      ...smoothedSection(),
      series: windows.map((window) => ({
        label: 'Reading',
        column: 'reading',
        reduction: 'average' as const,
        movingAverage: { window, label: 'Average' },
      })),
    };

    const result = sut(section);

    expect(result).toBe(expected);
  });

  it("reads a pivot's warm-up", () => {
    const sut = warmUpLookback;
    const section = {
      ...pivotSection(),
      pivot: {
        column: 'category',
        value: { column: 'amount', reduction: 'sum' as const },
        movingAverage: { window: 4, label: '{category} average' },
      },
    };

    const result = sut(section);

    expect(result).toBe(3);
  });

  it('starts a daily query six days before the displayed month', () => {
    const sut = planTimeSeriesSection;
    const section = smoothedSection();
    const period = Period.parse('month', '2026-08');
    if (period === null) throw new Error('Expected month');

    const result = sut(section, period, 'Asia/Tokyo');

    expect(result).toEqual({
      kind: 'time-series',
      sectionId: 'daily-smoothed',
      source: section.source,
      timeZone: 'Asia/Tokyo',
      selectedPeriod: '2026-08',
      dateRange: { firstDate: '2026-07-26', lastDate: '2026-08-31' },
      measures: [
        { column: 'temperature', reduction: 'average', transform: undefined },
      ],
      bucketLimit: 120,
      grain: 'day',
      warmUp: { lookback: 6, displayFrom: '2026-08-01' },
    });
  });

  it("starts an hourly query at the preceding day's twenty-second hour", () => {
    const sut = planTimeSeriesSection;
    const section: TimeSeriesSection = {
      ...smoothedSection(),
      grain: 'hour',
      window: 24,
      series: [
        {
          label: 'Temperature',
          column: 'temperature',
          reduction: 'average',
          movingAverage: { window: 3, label: '3-hour average' },
        },
      ],
    };
    const period = Period.parse('day', '2026-08-15');
    if (period === null) throw new Error('Expected day');

    const result = sut(section, period, 'Asia/Tokyo');

    expect(result).toMatchObject({
      grain: 'hour',
      firstHour: 22,
      dateRange: { firstDate: '2026-08-14', lastDate: '2026-08-15' },
      warmUp: { lookback: 2, displayFrom: '2026-08-15T00' },
    });
  });

  it('warms up a monthly pivot before its twelve displayed buckets', () => {
    const sut = planTimeSeriesPivot;
    const section: TimeSeriesSection = {
      ...pivotSection(),
      grain: undefined,
      window: 12,
      pivot: {
        column: 'category',
        value: { column: 'amount', reduction: 'sum' },
        movingAverage: { window: 3, label: '{category} average' },
      },
    };
    const period = Period.parse('month', '2026-08');
    if (period === null) throw new Error('Expected month');

    const result = sut(section, period, 'Asia/Tokyo');

    expect(result).toMatchObject({
      dateRange: { firstDate: '2025-07-01', lastDate: '2026-08-31' },
      buckets: {
        grain: 'month',
        bucketLimit: 120,
        warmUp: { lookback: 2, displayFrom: '2025-09' },
      },
    });
  });

  it.each([
    { section: rebasedSection(), expected: '2026-01-31' },
    { section: { ...smoothedSection(), id: 'monthly-trend' }, expected: null },
  ])('selects the fixed date for $section.id', ({ section, expected }) => {
    const sut = rebaseBaseDate;

    const result = sut(section);

    expect(result).toBe(expected);
  });

  it('reads the month containing a wide fixed base date', () => {
    const sut = planWideRebaseBase;
    const section = rebasedSection();

    const result = sut(section, 'month', '2026-01-31', 'Asia/Tokyo');

    expect(result).toEqual({
      kind: 'stat-tiles',
      sectionId: 'rebased-balances',
      grain: 'month',
      source: section.source,
      timeZone: 'Asia/Tokyo',
      selectedPeriod: '2026-01',
      dateRange: { firstDate: '2026-01-01', lastDate: '2026-01-31' },
      measures: [
        {
          column: 'first_value',
          reduction: 'latest',
          transform: undefined,
          compares: false,
        },
        {
          column: 'second_value',
          reduction: 'latest',
          transform: undefined,
          compares: false,
        },
      ],
    });
  });

  it('reads one day and category keys for a pivot fixed base', () => {
    const sut = planPivotRebaseBase;
    const section: TimeSeriesSection = {
      ...pivotSection(),
      source: {
        dataset: 'sample_dataset',
        view: 'entries',
        time: { column: 'recorded_at', type: 'timestamp' },
      },
      pivot: {
        column: 'category',
        value: { column: 'amount', reduction: 'sum', transform: 'absolute' },
      },
    };

    const result = sut(section, 'day', '2026-01-15', 'Asia/Tokyo');

    expect(result).toEqual({
      sectionId: 'by-room',
      source: section.source,
      timeZone: 'Asia/Tokyo',
      dateRange: { firstDate: '2026-01-15', lastDate: '2026-01-15' },
      measures: [{ column: 'amount', reduction: 'sum', transform: 'absolute' }],
      buckets: { grain: 'day', bucketLimit: 1 },
      category: { column: 'category', sortKey: null },
    });
  });
});
