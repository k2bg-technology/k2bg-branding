import { describe, expect, it } from 'vitest';

import { Period } from './period';

describe('Period', () => {
  it.each(['2026', '2026-00', '2026-13', '2026-1', 'not-a-month'])(
    'rejects invalid month text %s',
    (value) => {
      const result = Period.parse(value);

      expect(result).toBeNull();
    }
  );

  it('parses a month into its inclusive calendar bounds', () => {
    const result = Period.parse('2024-02');

    expect(result).toMatchObject({
      firstDate: '2024-02-01',
      lastDate: '2024-02-29',
    });
  });

  it.each([
    { start: '2025-12', offset: 1, expected: '2026-01' },
    { start: '2026-01', offset: -1, expected: '2025-12' },
    { start: '2026-01', offset: 14, expected: '2027-03' },
  ])(
    'moves $start by $offset months to $expected',
    ({ start, offset, expected }) => {
      const sut = Period.parse(start);

      const result = sut?.shift(offset).toString();

      expect(result).toBe(expected);
    }
  );
});
