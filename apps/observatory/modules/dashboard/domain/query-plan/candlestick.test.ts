import { describe, expect, it } from 'vitest';

import type { CandlestickSection } from '../definition';
import { Period } from '../period';
import { planSection } from './planSection';

describe('candlestick planning', () => {
  it('plans a trailing range and the fixed measures in open, high, low, close order', () => {
    const section: CandlestickSection = {
      id: 'daily-candles',
      title: 'Daily price range',
      kind: 'candlestick',
      source: { dataset: 'metrics', view: 'daily_quotes', time: 'quote_date' },
      grain: 'day',
      window: 10,
      format: { type: 'number' },
      open: { column: 'opening_value', label: 'Open' },
      high: { column: 'highest_value', label: 'High' },
      low: { column: 'lowest_value', label: 'Low' },
      close: { column: 'closing_value', label: 'Close' },
    };
    const period = Period.parse('month', '2026-02');
    if (period === null) throw new Error('Expected a fixture month');
    const sut = planSection;

    const plan = sut(section, period, 'Asia/Tokyo');

    expect(plan).toEqual({
      kind: 'candlestick',
      sectionId: 'daily-candles',
      grain: 'day',
      selectedPeriod: '2026-02',
      source: { dataset: 'metrics', view: 'daily_quotes', time: 'quote_date' },
      timeZone: 'Asia/Tokyo',
      dateRange: { firstDate: '2026-02-19', lastDate: '2026-02-28' },
      measures: [
        { column: 'opening_value', reduction: 'earliest' },
        { column: 'highest_value', reduction: 'maximum' },
        { column: 'lowest_value', reduction: 'minimum' },
        { column: 'closing_value', reduction: 'latest' },
      ],
      bucketLimit: 120,
    });
  });
});
