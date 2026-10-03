import { describe, expect, it } from 'vitest';

import { type DateBounds, Period } from './period';
import { periodNavigation } from './periodNavigation';

const dateBounds: DateBounds = {
  firstDate: '2026-07-15',
  lastDate: '2026-09-03',
};

describe('periodNavigation', () => {
  it.each([
    {
      scenario: 'at the first month',
      selectedMonth: '2026-07',
      bounds: dateBounds,
      expectedPreviousTarget: null,
      expectedNextTarget: '2026-08',
    },
    {
      scenario: 'at the last month',
      selectedMonth: '2026-09',
      bounds: dateBounds,
      expectedPreviousTarget: '2026-08',
      expectedNextTarget: null,
    },
    {
      scenario: 'inside the range',
      selectedMonth: '2026-08',
      bounds: dateBounds,
      expectedPreviousTarget: '2026-07',
      expectedNextTarget: '2026-09',
    },
    {
      scenario: 'before the range',
      selectedMonth: '2026-05',
      bounds: dateBounds,
      expectedPreviousTarget: null,
      expectedNextTarget: '2026-07',
    },
    {
      scenario: 'after the range',
      selectedMonth: '2026-12',
      bounds: dateBounds,
      expectedPreviousTarget: '2026-09',
      expectedNextTarget: null,
    },
  ])(
    'returns navigation targets $scenario',
    ({ selectedMonth, bounds, expectedPreviousTarget, expectedNextTarget }) => {
      const sut = periodNavigation;
      const selectedPeriod = Period.parse(selectedMonth);
      if (selectedPeriod === null) {
        throw new Error('Expected fixture period to parse');
      }

      const targets = sut(selectedPeriod, bounds);

      expect(targets.previousTarget?.toString() ?? null).toBe(
        expectedPreviousTarget
      );
      expect(targets.nextTarget?.toString() ?? null).toBe(expectedNextTarget);
    }
  );
});
