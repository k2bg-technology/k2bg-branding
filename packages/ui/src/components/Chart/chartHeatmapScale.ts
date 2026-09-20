import { seriesColorCss } from './chartTheme';
import type { ChartColor } from './types';

/** Level 0 is the bottom of the measured range and 4 its top; absence has no level. */
export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapScaleLabels {
  less: string;
  more: string;
}

const scaleLevels: HeatmapLevel[] = [0, 1, 2, 3, 4];

export const heatmapScaleLevels: readonly HeatmapLevel[] = scaleLevels;

/**
 * Opaque steps rather than an opacity ramp: a translucent cell inherits an
 * unknown surface, so its contrast ratio cannot be verified. The lowest step
 * keeps enough color to separate a measured zero from the chart surface.
 */
const levelMixPercentages: Record<HeatmapLevel, number> = {
  0: 20,
  1: 40,
  2: 60,
  3: 80,
  4: 100,
};

/**
 * A missing measurement reads as a hatch, so it stays apart from the lowest
 * filled step without relying on color alone.
 */
export const heatmapEmptyCellBackgroundImage =
  'repeating-linear-gradient(45deg, color-mix(in srgb, var(--color-base-black) 30%, transparent) 0 1px, transparent 1px 4px)';

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
  return scaleLevels[Math.min(Math.max(quartile, 1), 4)];
}

export function heatmapCellColor(
  level: HeatmapLevel,
  color: ChartColor
): string {
  return `color-mix(in srgb, ${seriesColorCss(color)} ${levelMixPercentages[level]}%, var(--color-base-white))`;
}
