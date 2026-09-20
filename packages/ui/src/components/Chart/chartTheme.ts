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
  'chart-6': 'var(--color-chart-6)',
  'chart-7': 'var(--color-chart-7)',
  'chart-8': 'var(--color-chart-8)',
  'chart-9': 'var(--color-chart-9)',
  'chart-10': 'var(--color-chart-10)',
  'chart-11': 'var(--color-chart-11)',
  'chart-12': 'var(--color-chart-12)',
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
  'chart-6',
  'chart-7',
  'chart-8',
  'chart-9',
  'chart-10',
  'chart-11',
  'chart-12',
];

/** How many series the palette can tell apart before colors run out. */
export const CHART_PALETTE_SIZE = paletteOrder.length;

/** Series past the palette share this neutral instead of a palette color. */
const overflowColorCss = 'var(--color-chart-overflow)';

export function seriesColorCss(color: ChartColor): string {
  return seriesColorVariables[color];
}

export function resolveSeriesColor(
  series: { color?: ChartColor },
  index: number
): string {
  if (series.color) {
    return seriesColorCss(series.color);
  }
  // Cycling the palette would hand two series one color and read as one group.
  // Folding the excess into a remainder is the caller's decision, so the chart
  // only declines to claim a thirteenth identity it does not have.
  return index >= 0 && index < CHART_PALETTE_SIZE
    ? seriesColorCss(paletteOrder[index])
    : overflowColorCss;
}

/**
 * Recharts forwards `aria-*` attributes to the focusable chart svg but does
 * not type them; spreading keeps the accessible name out of the SVG `<title>`
 * (which browsers would also show as a native hover tooltip).
 */
export function chartAccessibleName(label: string): { 'aria-label': string } {
  return { 'aria-label': label };
}
