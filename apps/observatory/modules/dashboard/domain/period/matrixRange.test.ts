import { describe, expect, it } from 'vitest';
import { resolveMatrixRange } from './matrixRange';
import { Period } from './period';

describe('resolveMatrixRange', () => {
  it.each([
    {
      name: 'month without window',
      grain: 'month' as const,
      key: '2026-08',
      window: undefined,
      first: '2026-08-01',
      last: '2026-08-31',
    },
    {
      name: 'week without window',
      grain: 'week' as const,
      key: '2027-W01',
      window: undefined,
      first: '2027-01-04',
      last: '2027-01-10',
    },
    {
      name: 'month with 84-day window',
      grain: 'month' as const,
      key: '2026-08',
      window: 84,
      first: '2026-06-09',
      last: '2026-08-31',
    },
    {
      name: 'day with one-day window',
      grain: 'day' as const,
      key: '2026-08-15',
      window: 1,
      first: '2026-08-15',
      last: '2026-08-15',
    },
  ])('resolves $name', ({ grain, key, window, first, last }) => {
    const period = Period.parse(grain, key);
    if (period === null) throw new Error('Expected period');
    const sut = resolveMatrixRange;

    const result = sut({ window }, period);

    expect(result).toEqual({ firstDate: first, lastDate: last });
  });
});
