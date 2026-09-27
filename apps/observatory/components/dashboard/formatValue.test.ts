import { describe, expect, it } from 'vitest';

import type { ValueFormat } from '../../modules/dashboard/domain';
import { formatValue } from './formatValue';

function createDisplay(
  format: ValueFormat,
  unit?: string
): { format: ValueFormat; unit?: string } {
  return {
    format,
    unit,
  };
}

describe('formatValue', () => {
  it.each([
    {
      name: 'a ratio percent',
      value: 0.125,
      tile: createDisplay({ type: 'percent', inputScale: 'ratio' }),
      expected: '13%',
    },
    {
      name: 'a percent-scale percent',
      value: 12.5,
      tile: createDisplay({ type: 'percent', inputScale: 'percent' }),
      expected: '13%',
    },
    {
      name: 'a currency',
      value: 1234,
      tile: createDisplay({ type: 'currency' }),
      expected: '$1,234.00',
    },
    {
      name: 'a number with a unit',
      value: 1234.5,
      tile: createDisplay({ type: 'number' }, 'kg'),
      expected: '1,234.5 kg',
    },
  ])('formats $name on the server', ({ value, tile, expected }) => {
    const result = formatValue(value, tile, {
      locale: 'en-US',
      currency: 'USD',
    });

    expect(result).toBe(expected);
  });

  it('uses the dashboard locale for separators', () => {
    const result = formatValue(1234.5, createDisplay({ type: 'number' }), {
      locale: 'de-DE',
    });

    expect(result).toBe('1.234,5');
  });

  it.each([
    {
      value: 27000,
      inputUnit: 'seconds' as const,
      locale: 'en-US',
      expected: '7 hr 30 min',
    },
    {
      value: 45,
      inputUnit: 'minutes' as const,
      locale: 'en-US',
      expected: '45 min',
    },
    {
      value: 2,
      inputUnit: 'hours' as const,
      locale: 'en-US',
      expected: '2 hr',
    },
    {
      value: 27000,
      inputUnit: 'seconds' as const,
      locale: 'ja-JP',
      expected: '7 時間 30 分',
    },
  ])(
    'formats $value $inputUnit as a whole-minute duration in $locale',
    ({ value, inputUnit, locale, expected }) => {
      expect(
        formatValue(
          value,
          { format: { type: 'duration', inputUnit } },
          { locale }
        )
      ).toBe(expected);
    }
  );

  it('places a negative delta sign on the first duration part only', () => {
    expect(
      formatValue(
        -600,
        { format: { type: 'duration', inputUnit: 'seconds' } },
        { locale: 'en-US' },
        'always'
      )
    ).toBe('-10 min');
    expect(
      formatValue(
        -27000,
        { format: { type: 'duration', inputUnit: 'seconds' } },
        { locale: 'en-US' },
        'always'
      )
    ).toBe('-7 hr 30 min');
    expect(
      formatValue(
        27000,
        { format: { type: 'duration', inputUnit: 'seconds' } },
        { locale: 'en-US' },
        'always'
      )
    ).toBe('+7 hr 30 min');
  });

  it('rounds half minutes away from zero', () => {
    const display = {
      format: { type: 'duration' as const, inputUnit: 'seconds' as const },
    };

    expect(formatValue(30, display, { locale: 'en-US' })).toBe('1 min');
    expect(formatValue(-30, display, { locale: 'en-US' })).toBe('-1 min');
  });
});
