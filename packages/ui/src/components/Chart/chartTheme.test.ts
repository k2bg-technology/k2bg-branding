import { describe, expect, it } from 'vitest';

import { resolveSeriesColor, seriesColorCss } from './chartTheme';
import { ChartColor } from './types';

describe('seriesColorCss', () => {
  it.each`
    color                 | expected
    ${ChartColor.CHART_1} | ${'var(--color-chart-1)'}
    ${ChartColor.CHART_2} | ${'var(--color-chart-2)'}
    ${ChartColor.CHART_3} | ${'var(--color-chart-3)'}
    ${ChartColor.CHART_4} | ${'var(--color-chart-4)'}
    ${ChartColor.CHART_5} | ${'var(--color-chart-5)'}
    ${ChartColor.SUCCESS} | ${'var(--color-success)'}
    ${ChartColor.ERROR}   | ${'var(--color-error)'}
    ${ChartColor.WARNING} | ${'var(--color-warning)'}
    ${ChartColor.INFO}    | ${'var(--color-info)'}
  `('maps $color to $expected', ({ color, expected }) => {
    const result = seriesColorCss(color);

    expect(result).toBe(expected);
  });
});

describe('resolveSeriesColor', () => {
  it('uses the explicit series color over the palette', () => {
    const series = { color: ChartColor.ERROR };
    const paletteIndex = 0;

    const result = resolveSeriesColor(series, paletteIndex);

    expect(result).toBe('var(--color-error)');
  });

  it.each`
    index | expected
    ${0}  | ${'var(--color-chart-1)'}
    ${1}  | ${'var(--color-chart-2)'}
    ${4}  | ${'var(--color-chart-5)'}
    ${5}  | ${'var(--color-chart-1)'}
    ${7}  | ${'var(--color-chart-3)'}
  `(
    'cycles through the palette for series index $index',
    ({ index, expected }) => {
      const series = {};

      const result = resolveSeriesColor(series, index);

      expect(result).toBe(expected);
    }
  );
});
