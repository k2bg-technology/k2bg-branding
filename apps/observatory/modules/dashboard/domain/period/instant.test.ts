import { describe, expect, it } from 'vitest';
import { toInstant } from './instant';
import { Period } from './period';
import { resolveSectionRange } from './sectionRange';
import { timeSeriesSpine } from './timeSeriesSpine';

describe('toInstant', () => {
  it.each([
    {
      date: '2026-08-15',
      hour: 0,
      zone: 'Asia/Tokyo',
      expected: 1786719600000,
    },
    {
      date: '2026-08-15',
      hour: 23,
      zone: 'Asia/Tokyo',
      expected: 1786802400000,
    },
    {
      date: '2026-03-08',
      hour: 1,
      zone: 'America/New_York',
      expected: 1772949600000,
    },
    { date: '2026-03-08', hour: 2, zone: 'America/New_York', expected: null },
    {
      date: '2026-03-08',
      hour: 3,
      zone: 'America/New_York',
      expected: 1772953200000,
    },
    {
      date: '2026-11-01',
      hour: 1,
      zone: 'America/New_York',
      expected: 1793509200000,
    },
    { date: '2018-11-04', hour: 0, zone: 'America/Sao_Paulo', expected: null },
    {
      date: '2018-11-04',
      hour: 1,
      zone: 'America/Sao_Paulo',
      expected: 1541300400000,
    },
  ])('resolves $date hour $hour in $zone', ({ date, hour, zone, expected }) => {
    expect(toInstant(date, hour, zone)).toBe(expected);
  });

  it('uses the first existing hour for a date whose midnight does not exist', () => {
    const selected = Period.parse('day', '2018-11-04');
    if (selected === null) {
      throw new Error('Expected date period');
    }
    const range = resolveSectionRange({ window: 1 }, selected);

    const result = timeSeriesSpine(
      range,
      [{ period: '2018-11-04', values: [7] }],
      1,
      'America/Sao_Paulo'
    );

    expect(result).toEqual([
      { period: '2018-11-04', timestamp: 1541300400000, values: [7] },
    ]);
  });

  it('resolves adjacent local midnights across a spring transition', () => {
    const first = toInstant('2026-03-08', 0, 'America/New_York');
    const last = toInstant('2026-03-09', 0, 'America/New_York');
    if (first === null || last === null) {
      throw new Error('Expected both local midnights');
    }

    expect(last - first).toBe(23 * 3_600_000);
  });
});
