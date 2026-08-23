import type { ChartColor } from './types';

/**
 * Series colors resolve to the `--color-chart-*` tokens declared in
 * `globals.css`; their order is validated for color-vision-deficiency
 * separation, so series fall through the palette in this sequence.
 */
const seriesColorVariables: Record<ChartColor, string> = {
  'chart-1': 'var(--color-chart-1)',
  'chart-2': 'var(--color-chart-2)',
  'chart-3': 'var(--color-chart-3)',
  'chart-4': 'var(--color-chart-4)',
  'chart-5': 'var(--color-chart-5)',
  success: 'var(--color-success)',
  error: 'var(--color-error)',
  warning: 'var(--color-warning)',
  info: 'var(--color-info)',
};

const paletteOrder: ChartColor[] = [
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
];

export function seriesColorCss(color: ChartColor): string {
  return seriesColorVariables[color];
}

export function resolveSeriesColor(
  series: { color?: ChartColor },
  index: number
): string {
  const color = series.color ?? paletteOrder[index % paletteOrder.length];
  return seriesColorCss(color);
}

/**
 * Recharts forwards `aria-*` attributes to the focusable chart svg but does
 * not type them; spreading keeps the accessible name out of the SVG `<title>`
 * (which browsers would also show as a native hover tooltip).
 */
export function chartAccessibleName(label: string): { 'aria-label': string } {
  return { 'aria-label': label };
}
