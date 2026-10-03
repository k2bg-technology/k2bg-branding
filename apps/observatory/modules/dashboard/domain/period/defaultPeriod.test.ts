import { describe, expect, it } from 'vitest';

import { resolveDefaultPeriod } from './defaultPeriod';

const bounds = { firstDate: '2026-07-15', lastDate: '2026-09-03' };

describe('resolveDefaultPeriod', () => {
  it('opens the month containing the last data date', () => {
    const result = resolveDefaultPeriod({
      grain: 'month',
      defaultPeriod: 'latest-with-data',
      timeZone: 'UTC',
      bounds,
      now: Date.parse('2026-08-01T00:00:00Z'),
    });

    expect(result.toString()).toBe('2026-09');
  });

  it('uses the previous month in the dashboard time zone', () => {
    const result = resolveDefaultPeriod({
      grain: 'month',
      defaultPeriod: 'last-complete',
      timeZone: 'Asia/Tokyo',
      bounds,
      now: Date.parse('2026-08-31T15:30:00Z'),
    });

    expect(result.toString()).toBe('2026-08');
  });

  it.each([
    { now: '2026-07-01T00:00:00Z', expected: '2026-07' },
    { now: '2027-02-01T00:00:00Z', expected: '2026-09' },
  ])('clamps last-complete to $expected', ({ now, expected }) => {
    const result = resolveDefaultPeriod({
      grain: 'month',
      defaultPeriod: 'last-complete',
      timeZone: 'UTC',
      bounds,
      now: Date.parse(now),
    });

    expect(result.toString()).toBe(expected);
  });

  it.each([
    {
      grain: 'day',
      timeZone: 'Asia/Tokyo',
      now: '2026-08-31T15:30:00Z',
      expected: '2026-08-31',
    },
    {
      grain: 'day',
      timeZone: 'UTC',
      now: '2026-08-31T15:30:00Z',
      expected: '2026-08-30',
    },
    {
      grain: 'week',
      timeZone: 'Asia/Tokyo',
      now: '2026-09-06T20:00:00Z',
      expected: '2026-W36',
    },
    {
      grain: 'week',
      timeZone: 'UTC',
      now: '2026-09-06T20:00:00Z',
      expected: '2026-W35',
    },
  ] as const)(
    'uses the previous $grain in $timeZone',
    ({ grain, timeZone, now, expected }) => {
      const result = resolveDefaultPeriod({
        grain,
        defaultPeriod: 'last-complete',
        timeZone,
        bounds,
        now: Date.parse(now),
      });

      expect(result.toString()).toBe(expected);
    }
  );

  it('opens the ISO week containing the last data date across a year boundary', () => {
    const result = resolveDefaultPeriod({
      grain: 'week',
      defaultPeriod: 'latest-with-data',
      timeZone: 'UTC',
      bounds: { firstDate: '2026-12-01', lastDate: '2027-01-01' },
      now: Date.parse('2027-02-01T00:00:00Z'),
    });

    expect(result.toString()).toBe('2026-W53');
  });

  it.each([
    { now: '2026-07-15T00:00:00Z', expected: '2026-07-15' },
    { now: '2026-09-05T00:00:00Z', expected: '2026-09-03' },
  ])('clamps a last-complete day to $expected', ({ now, expected }) => {
    const result = resolveDefaultPeriod({
      grain: 'day',
      defaultPeriod: 'last-complete',
      timeZone: 'UTC',
      bounds,
      now: Date.parse(now),
    });

    expect(result.toString()).toBe(expected);
  });
});
