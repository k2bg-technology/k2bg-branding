import { describe, expect, it } from 'vitest';

import { resolveDefaultPeriod } from './defaultPeriod';

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
