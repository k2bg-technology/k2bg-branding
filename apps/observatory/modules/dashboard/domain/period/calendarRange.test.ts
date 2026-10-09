import { describe, expect, it } from 'vitest';

import { resolveCalendarRange } from './calendarRange';
import { Period } from './period';

describe('resolveCalendarRange', () => {
  it.each([
    {
      name: 'trailing 7 at month 2026-08',
      grain: 'month',
      key: '2026-08',
      section: { range: 'trailing', window: 7 },
      first: '2026-08-25',
      last: '2026-08-31',
    },
    {
      name: 'calendar-year at month 2026-03',
      grain: 'month',
      key: '2026-03',
      section: { range: 'calendar-year' },
      first: '2026-01-01',
      last: '2026-12-31',
    },
    {
      name: 'calendar-year at week 2026-W01',
      grain: 'week',
      key: '2026-W01',
      section: { range: 'calendar-year' },
      first: '2026-01-01',
      last: '2026-12-31',
    },
    {
      name: 'trailing 366 at month 2028-12',
      grain: 'month',
      key: '2028-12',
      section: { range: 'trailing', window: 366 },
      first: '2028-01-01',
      last: '2028-12-31',
    },
  ] as const)('resolves $name', ({ grain, key, section, first, last }) => {
    const selectedPeriod = Period.parse(grain, key);
    if (selectedPeriod === null) {
      throw new Error('Expected selected period');
    }

    const result = resolveCalendarRange(section, selectedPeriod);

    expect(result).toEqual({ firstDate: first, lastDate: last });
  });
});
