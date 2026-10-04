import { describe, expect, it } from 'vitest';

import { Period } from './period';
import { resolveSectionRange } from './sectionRange';

function selected(grain: 'month' | 'week' | 'day', key: string) {
  const period = Period.parse(grain, key);
  if (period === null) {
    throw new Error('Expected selected period');
  }
  return period;
}

describe('resolveSectionRange', () => {
  it.each([
    {
      selectedGrain: 'month',
      key: '2026-02',
      section: { grain: 'day' },
      first: '2026-02-01',
      last: '2026-02-28',
    },
    {
      selectedGrain: 'week',
      key: '2026-W01',
      section: { grain: 'day' },
      first: '2025-12-29',
      last: '2026-01-04',
    },
    {
      selectedGrain: 'day',
      key: '2026-08-15',
      section: { grain: 'hour' },
      first: '2026-08-15',
      last: '2026-08-15',
      firstHour: 0,
    },
    {
      selectedGrain: 'day',
      key: '2026-08-15',
      section: { grain: 'hour', window: 48 },
      first: '2026-08-14',
      last: '2026-08-15',
      firstHour: 0,
    },
    {
      selectedGrain: 'day',
      key: '2026-08-15',
      section: { grain: 'hour', window: 30 },
      first: '2026-08-14',
      last: '2026-08-15',
      firstHour: 18,
    },
    {
      selectedGrain: 'month',
      key: '2026-03',
      section: { window: 3 },
      first: '2026-01-01',
      last: '2026-03-31',
    },
  ] as const)(
    'resolves $key with $section',
    ({ selectedGrain, key, section, first, last, ...rest }) => {
      const result = resolveSectionRange(section, selected(selectedGrain, key));

      expect(result.dateRange).toEqual({ firstDate: first, lastDate: last });
      if ('firstHour' in rest) {
        expect(result).toMatchObject({ firstHour: rest.firstHour });
      }
    }
  );

  it('keeps fetch bounds when returned buckets truncate the display', () => {
    const result = resolveSectionRange(
      { grain: 'hour', window: 48 },
      selected('day', '2026-08-15'),
      { truncated: true, firstBucket: '2026-08-15T03' }
    );

    expect(result.dateRange).toEqual({
      firstDate: '2026-08-14',
      lastDate: '2026-08-15',
    });
    expect(result.display).toEqual({
      first: { date: '2026-08-15', hour: 3 },
      last: { date: '2026-08-15', hour: 23 },
    });
  });

  it('preserves a same-grain window with an explicit override', () => {
    const result = resolveSectionRange(
      { grain: 'month', window: 3 },
      selected('month', '2026-03')
    );

    expect(result.dateRange).toEqual({
      firstDate: '2026-01-01',
      lastDate: '2026-03-31',
    });
    expect(result.display).toEqual({
      first: { date: '2026-01-01', hour: 0 },
      last: { date: '2026-03-01', hour: 0 },
    });
  });

  it('extends a finer window before the selected period', () => {
    const result = resolveSectionRange(
      { grain: 'day', window: 35 },
      selected('month', '2026-04')
    );

    expect(result.dateRange).toEqual({
      firstDate: '2026-03-27',
      lastDate: '2026-04-30',
    });
  });
});
