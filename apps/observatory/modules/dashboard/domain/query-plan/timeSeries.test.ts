import { describe, expect, it } from 'vitest';

import type { TimeSeriesSection } from '../definition';
import { Period } from '../period';
import { layoutWideSeries, planTimeSeriesPivot } from './timeSeries';

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
