import { describe, expect, it } from 'vitest';

import {
  heatmapCellColor,
  heatmapFilledLevels,
  heatmapLevel,
} from './chartHeatmapScale';
import { ChartColor } from './types';

const emptyLevel = 0;
const topLevel = 4;
const scaleMin = 0;
const scaleMax = 100;

describe('heatmapLevel', () => {
  it.each`
    value  | expected
    ${-5}  | ${0}
    ${0}   | ${0}
    ${1}   | ${1}
    ${25}  | ${1}
    ${26}  | ${2}
    ${50}  | ${2}
    ${51}  | ${3}
    ${75}  | ${3}
    ${76}  | ${4}
    ${100} | ${4}
  `(
    'places $value on level $expected over a 0 to 100 range',
    ({ value, expected }) => {
      const result = heatmapLevel(value, scaleMin, scaleMax);

      expect(result).toBe(expected);
    }
  );

  it('holds a value above the range at the top level', () => {
    const aboveRange = scaleMax * 4;

    const result = heatmapLevel(aboveRange, scaleMin, scaleMax);

    expect(result).toBe(topLevel);
  });

  it.each`
    value  | expected
    ${100} | ${0}
    ${125} | ${1}
    ${150} | ${2}
    ${200} | ${4}
  `(
    'measures level $expected for $value from a minimum of 100',
    ({ value, expected }) => {
      const offsetMin = 100;
      const offsetMax = 200;

      const result = heatmapLevel(value, offsetMin, offsetMax);

      expect(result).toBe(expected);
    }
  );

  it('returns the top level when a collapsed range sits below the value', () => {
    const collapsedBound = 7;

    const result = heatmapLevel(
      collapsedBound + 1,
      collapsedBound,
      collapsedBound
    );

    expect(result).toBe(topLevel);
  });

  it('returns the empty level when a collapsed range meets the value', () => {
    const collapsedBound = 7;

    const result = heatmapLevel(collapsedBound, collapsedBound, collapsedBound);

    expect(result).toBe(emptyLevel);
  });
});

describe('heatmapCellColor', () => {
  it('paints the empty level as the neutral surface', () => {
    const result = heatmapCellColor(emptyLevel, ChartColor.CHART_1);

    expect(result).toBe('var(--color-base-light)');
  });

  it.each`
    level | percentage
    ${1}  | ${40}
    ${2}  | ${60}
    ${3}  | ${80}
    ${4}  | ${100}
  `(
    'mixes level $level from $percentage% of the series color',
    ({ level, percentage }) => {
      const result = heatmapCellColor(level, ChartColor.CHART_1);

      expect(result).toBe(
        `color-mix(in srgb, var(--color-chart-1) ${percentage}%, var(--color-base-white))`
      );
    }
  );

  it('mixes the given series color rather than the palette default', () => {
    const middleLevel = 2;

    const result = heatmapCellColor(middleLevel, ChartColor.WARNING);

    expect(result).toContain('var(--color-warning)');
  });
});

describe('heatmapFilledLevels', () => {
  it('lists the four filled levels in ascending order', () => {
    expect(heatmapFilledLevels).toEqual([1, 2, 3, 4]);
  });
});
