import { describe, expect, it } from 'vitest';

import { formatPeriodRange, Period } from './period';

describe('Period', () => {
  it.each(['2026', '2026-00', '2026-13', '2026-1', 'not-a-month'])(
    'rejects invalid month text %s',
    (value) => {
      const result = Period.parse('month', value);

      expect(result).toBeNull();
    }
  );

  it('parses a month into its inclusive calendar bounds', () => {
    const result = Period.parse('month', '2024-02');

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
      const sut = Period.parse('month', start);

      const result = sut?.shift(offset).toString();

      expect(result).toBe(expected);
    }
  );

  it.each([
    { text: '2026-W01', firstDate: '2025-12-29', lastDate: '2026-01-04' },
    { text: '2026-W53', firstDate: '2026-12-28', lastDate: '2027-01-03' },
    { text: '2020-W53', firstDate: '2020-12-28', lastDate: '2021-01-03' },
  ])(
    'parses ISO week $text into its inclusive calendar bounds',
    ({ text, firstDate, lastDate }) => {
      const result = Period.parse('week', text);

      expect(result).toMatchObject({ firstDate, lastDate });
    }
  );

  it.each([
    { grain: 'week', text: '2021-W53' },
    { grain: 'week', text: '2026-W00' },
    { grain: 'week', text: '2026-W54' },
    { grain: 'week', text: '2026-W1' },
    { grain: 'week', text: '2026-06' },
    { grain: 'month', text: '2026-W01' },
    { grain: 'day', text: '2026-06' },
    { grain: 'month', text: '2026-06-15' },
    { grain: 'day', text: '2026-02-30' },
  ] as const)('rejects $grain period text $text', ({ grain, text }) => {
    const result = Period.parse(grain, text);

    expect(result).toBeNull();
  });

  it.each([
    { grain: 'week', date: '2027-01-01', expected: '2026-W53' },
    { grain: 'week', date: '2026-01-01', expected: '2026-W01' },
    { grain: 'week', date: '2021-01-01', expected: '2020-W53' },
    { grain: 'day', date: '2026-08-15', expected: '2026-08-15' },
  ] as const)(
    'finds the $grain $expected containing $date',
    ({ grain, date, expected }) => {
      const result = Period.containing(grain, date);

      expect(result?.toString()).toBe(expected);
    }
  );

  it.each([
    { grain: 'week', start: '2026-W53', offset: 1, expected: '2027-W01' },
    { grain: 'week', start: '2027-W01', offset: -1, expected: '2026-W53' },
    { grain: 'week', start: '2020-W53', offset: 1, expected: '2021-W01' },
    { grain: 'day', start: '2026-02-28', offset: 1, expected: '2026-03-01' },
    { grain: 'day', start: '2024-02-28', offset: 1, expected: '2024-02-29' },
    { grain: 'day', start: '2026-01-01', offset: -1, expected: '2025-12-31' },
  ] as const)(
    'moves $grain $start by $offset to $expected',
    ({ grain, start, offset, expected }) => {
      const sut = Period.parse(grain, start);

      const result = sut?.shift(offset).toString();

      expect(result).toBe(expected);
    }
  );

  it.each([
    {
      grain: 'week',
      text: '2026-W01',
      locale: 'en-US',
      expected: 'Dec 29, 2025 – Jan 4, 2026',
    },
    {
      grain: 'week',
      text: '2026-W01',
      locale: 'ja-JP',
      expected: '2025/12/29～2026/01/04',
    },
    {
      grain: 'day',
      text: '2026-01-01',
      locale: 'en-US',
      expected: 'January 1, 2026',
    },
    {
      grain: 'day',
      text: '2026-01-01',
      locale: 'ja-JP',
      expected: '2026年1月1日',
    },
  ] as const)(
    'labels $grain $text in $locale',
    ({ grain, text, locale, expected }) => {
      const sut = Period.parse(grain, text);

      const result = sut?.label(locale).replace(/\s/g, ' ');

      expect(result).toBe(expected);
    }
  );
});

describe('formatPeriodRange', () => {
  it.each([
    ['month', '2025-09', '2026-08', 'en-US', 'Sep 2025 – Aug 2026'],
    ['month', '2026-01', '2026-03', 'en-US', 'Jan – Mar 2026'],
    ['month', '2026-03', '2026-03', 'en-US', 'Mar 2026'],
    ['month', '2026-02', '2026-03', 'ja-JP', '2026/02～2026/03'],
    ['week', '2026-W52', '2027-W01', 'en-US', 'Dec 21, 2026 – Jan 10, 2027'],
    ['week', '2026-W52', '2027-W01', 'ja-JP', '2026/12/21～2027/01/10'],
    ['day', '2026-02-26', '2026-03-04', 'en-US', 'Feb 26 – Mar 4, 2026'],
    ['day', '2026-02-26', '2026-03-04', 'ja-JP', '2026/02/26～2026/03/04'],
    ['day', '2026-03-02', '2026-03-02', 'en-US', 'Mar 2, 2026'],
  ] as const)(
    'formats %s range %s through %s in %s',
    (grain, firstText, lastText, locale, expected) => {
      const first = Period.parse(grain, firstText);
      const last = Period.parse(grain, lastText);
      if (first === null || last === null) {
        throw new Error('Expected fixture range to parse');
      }

      const result = formatPeriodRange(first, last, locale).replace(/\s/g, ' ');

      expect(result).toBe(expected);
    }
  );
});
