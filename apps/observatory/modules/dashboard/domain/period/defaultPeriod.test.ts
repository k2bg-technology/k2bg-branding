import { describe, expect, it } from 'vitest';

import { resolveDefaultPeriod } from './defaultPeriod';
import { Period } from './period';
import { periodNavigation } from './periodNavigation';

const bounds = { firstDate: '2026-07-15', lastDate: '2026-09-03' };

describe('resolveDefaultPeriod', () => {
  it('opens the month containing the last data date', () => {
    const result = resolveDefaultPeriod({
      defaultPeriod: 'latest-with-data',
      timeZone: 'UTC',
      bounds,
      now: Date.parse('2026-08-01T00:00:00Z'),
    });

    expect(result.toString()).toBe('2026-09');
  });

  it('uses the previous month in the dashboard time zone', () => {
    const result = resolveDefaultPeriod({
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
      defaultPeriod: 'last-complete',
      timeZone: 'UTC',
      bounds,
      now: Date.parse(now),
    });

    expect(result.toString()).toBe(expected);
  });
});

describe('periodNavigation', () => {
  it.each([
    { period: '2026-07', previous: null, next: '2026-08' },
    { period: '2026-08', previous: '2026-07', next: '2026-09' },
    { period: '2026-09', previous: '2026-08', next: null },
    { period: '2026-06', previous: null, next: '2026-07' },
    { period: '2026-10', previous: '2026-09', next: null },
  ])('moves toward data from $period', ({ period, previous, next }) => {
    const selected = Period.parse(period);
    if (selected === null) {
      throw new Error('Expected fixture period to parse');
    }

    const result = periodNavigation(selected, bounds);

    expect(result.previousTarget?.toString() ?? null).toBe(previous);
    expect(result.nextTarget?.toString() ?? null).toBe(next);
  });
});
