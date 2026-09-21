import { describe, expect, it } from 'vitest';

import type { StatTileDefinition } from '../../modules/dashboard/domain';
import { formatValue } from './formatValue';

function createTile(
  format: StatTileDefinition['format'],
  unit?: string
): StatTileDefinition {
  return {
    label: 'Value',
    column: 'value',
    reduction: 'sum',
    format,
    unit,
  };
}

describe('formatValue', () => {
  it.each([
    {
      name: 'a ratio percent',
      value: 0.125,
      tile: createTile({ type: 'percent', inputScale: 'ratio' }),
      expected: '13%',
    },
    {
      name: 'a percent-scale percent',
      value: 12.5,
      tile: createTile({ type: 'percent', inputScale: 'percent' }),
      expected: '13%',
    },
    {
      name: 'a currency',
      value: 1234,
      tile: createTile({ type: 'currency' }),
      expected: '$1,234.00',
    },
    {
      name: 'a number with a unit',
      value: 1234.5,
      tile: createTile({ type: 'number' }, 'kg'),
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
    const result = formatValue(1234.5, createTile({ type: 'number' }), {
      locale: 'de-DE',
    });

    expect(result).toBe('1.234,5');
  });
});
