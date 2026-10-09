import { describe, expect, it } from 'vitest';
import type { Availability, AvailabilityInput } from './availability';
import { resolveAvailability } from './availability';

describe('resolveAvailability', () => {
  it.each<{ input: AvailabilityInput; expected: Availability }>([
    {
      input: {
        grain: 'month',
        since: '2026-03-15',
        minimumBuckets: 3,
        lastDate: '2026-05-31',
      },
      expected: {
        status: 'accumulating',
        availableFrom: {
          grain: 'month',
          start: { date: '2026-06-01', hour: 0 },
        },
      },
    },
    {
      input: {
        grain: 'month',
        since: '2026-03-15',
        minimumBuckets: 3,
        lastDate: '2026-06-30',
      },
      expected: { status: 'available' },
    },
    {
      input: {
        grain: 'week',
        since: '2025-12-31',
        minimumBuckets: 2,
        lastDate: '2026-01-11',
      },
      expected: {
        status: 'accumulating',
        availableFrom: {
          grain: 'week',
          start: { date: '2026-01-12', hour: 0 },
        },
      },
    },
    {
      input: {
        grain: 'week',
        since: '2025-12-31',
        minimumBuckets: 2,
        lastDate: '2026-01-12',
      },
      expected: { status: 'available' },
    },
    {
      input: {
        grain: 'day',
        since: '2026-08-15',
        minimumBuckets: 7,
        lastDate: '2026-08-21',
      },
      expected: {
        status: 'accumulating',
        availableFrom: { grain: 'day', start: { date: '2026-08-22', hour: 0 } },
      },
    },
    {
      input: {
        grain: 'day',
        since: '2026-08-15',
        minimumBuckets: 7,
        lastDate: '2026-08-22',
      },
      expected: { status: 'available' },
    },
    {
      input: {
        grain: 'hour',
        since: '2026-08-15',
        minimumBuckets: 30,
        lastDate: '2026-08-15',
      },
      expected: {
        status: 'accumulating',
        availableFrom: {
          grain: 'hour',
          start: { date: '2026-08-16', hour: 6 },
        },
      },
    },
    {
      input: {
        grain: 'hour',
        since: '2026-08-15',
        minimumBuckets: 30,
        lastDate: '2026-08-16',
      },
      expected: { status: 'available' },
    },
    {
      input: {
        grain: 'month',
        since: '2026-03-15',
        minimumBuckets: 1,
        lastDate: '2026-02-28',
      },
      expected: {
        status: 'accumulating',
        availableFrom: {
          grain: 'month',
          start: { date: '2026-04-01', hour: 0 },
        },
      },
    },
  ])(
    'resolves $input.grain from $input.since through $input.lastDate',
    ({ input, expected }) => {
      expect(resolveAvailability(input)).toEqual(expected);
    }
  );
});
