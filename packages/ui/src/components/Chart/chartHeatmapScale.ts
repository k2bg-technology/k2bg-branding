import { seriesColorCss } from './chartTheme';
import type { ChartColor } from './types';

/** Level 0 is the empty step; 1–4 are the quartiles of the filled range. */
export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapScaleLabels {
  less: string;
  more: string;
}

const filledLevels: HeatmapLevel[] = [1, 2, 3, 4];

export const heatmapFilledLevels: readonly HeatmapLevel[] = filledLevels;

/**
 * Opaque steps rather than an opacity ramp: a translucent cell inherits an
 * unknown surface, so its contrast ratio cannot be verified.
 */
const levelMixPercentages: Record<Exclude<HeatmapLevel, 0>, number> = {
  1: 40,
  2: 60,
  3: 80,
  4: 100,
};

export function heatmapLevel(
  value: number,
  min: number,
  max: number
): HeatmapLevel {
  if (value <= min) {
    return 0;
  }
  if (max <= min) {
    return 4;
  }
  const quartile = Math.ceil(((value - min) / (max - min)) * 4);
  return filledLevels[Math.min(Math.max(quartile, 1), 4) - 1];
}

export function heatmapCellColor(
  level: HeatmapLevel,
  color: ChartColor
): string {
  if (level === 0) {
    return 'var(--color-base-light)';
  }
  return `color-mix(in srgb, ${seriesColorCss(color)} ${levelMixPercentages[level]}%, var(--color-base-white))`;
}
