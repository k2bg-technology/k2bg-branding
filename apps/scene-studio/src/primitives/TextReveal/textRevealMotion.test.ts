import { describe, expect, it } from 'vitest';

import {
  getTextUnitMotion,
  groupUnitsIntoWrappableRuns,
  splitTextIntoUnits,
} from './textRevealMotion';

const enterDelayInFrames = 10;
const staggerInFrames = 3;
const unitDurationInFrames = 12;
const offsetInPx = 40;
const blurInPx = 8;

function getMotionAtFrame(input: { unitIndex: number; frame: number }) {
  return getTextUnitMotion({
    ...input,
    enterDelayInFrames,
    staggerInFrames,
    unitDurationInFrames,
    offsetInPx,
    blurInPx,
  });
}

describe('splitTextIntoUnits', () => {
  it.each([
    {
      description: 'splits ASCII text into single characters',
      text: 'Sea',
      splitBy: 'character' as const,
      expectedUnits: ['S', 'e', 'a'],
    },
    {
      description: 'keeps Japanese characters whole',
      text: '東京',
      splitBy: 'character' as const,
      expectedUnits: ['東', '京'],
    },
    {
      description: 'keeps a surrogate pair as one unit',
      text: '𠮷野',
      splitBy: 'character' as const,
      expectedUnits: ['𠮷', '野'],
    },
    {
      description: 'keeps whitespace runs as their own units in word mode',
      text: 'Sea  Level',
      splitBy: 'word' as const,
      expectedUnits: ['Sea', '  ', 'Level'],
    },
    {
      description: 'drops the empty strings around a leading whitespace run',
      text: ' Sea',
      splitBy: 'word' as const,
      expectedUnits: [' ', 'Sea'],
    },
  ])('$description', ({ text, splitBy, expectedUnits }) => {
    const result = splitTextIntoUnits({ text, splitBy });

    expect(result).toEqual(expectedUnits);
  });
});

describe('getTextUnitMotion', () => {
  it.each([
    {
      description: 'keeps a unit hidden before its stagger slot opens',
      unitIndex: 2,
      frame: 10,
    },
    {
      description: 'clamps to the hidden state for negative frames',
      unitIndex: 0,
      frame: -30,
    },
  ])('$description', ({ unitIndex, frame }) => {
    const result = getMotionAtFrame({ unitIndex, frame });

    expect(result.opacity).toBeCloseTo(0);
    expect(result.translateYInPx).toBeCloseTo(offsetInPx);
    expect(result.blurInPx).toBeCloseTo(blurInPx);
  });

  it.each([{ unitIndex: 0 }, { unitIndex: 3 }, { unitIndex: 7 }])(
    'settles unit $unitIndex once its stagger slot and duration have passed',
    ({ unitIndex }) => {
      const settledFrame =
        enterDelayInFrames + unitIndex * staggerInFrames + unitDurationInFrames;

      const result = getMotionAtFrame({ unitIndex, frame: settledFrame });

      expect(result.opacity).toBeCloseTo(1);
      expect(result.translateYInPx).toBeCloseTo(0);
      expect(result.blurInPx).toBeCloseTo(0);
    }
  );

  it.each([
    { unitIndex: 1, frame: 16 },
    { unitIndex: 2, frame: 20 },
    { unitIndex: 5, frame: 30 },
  ])(
    'starts unit $unitIndex one stagger step behind the previous unit',
    ({ unitIndex, frame }) => {
      const result = getMotionAtFrame({ unitIndex, frame });

      const previousResult = getMotionAtFrame({
        unitIndex: unitIndex - 1,
        frame: frame - staggerInFrames,
      });
      expect(result.opacity).toBeCloseTo(previousResult.opacity);
      expect(result.opacity).toBeGreaterThan(0);
      expect(result.opacity).toBeLessThan(1);
    }
  );
});

describe('groupUnitsIntoWrappableRuns', () => {
  it.each([
    {
      description: 'groups consecutive Latin characters into word runs',
      units: ['S', 'e', 'a', ' ', 'a', 'i', 'r'],
      expectedRunTexts: ['Sea', ' ', 'air'],
    },
    {
      description: 'keeps each Japanese character as its own run',
      units: ['東', '京'],
      expectedRunTexts: ['東', '京'],
    },
    {
      description: 'separates Latin words from Japanese characters',
      units: ['K', '2', ' ', '東', '京'],
      expectedRunTexts: ['K2', ' ', '東', '京'],
    },
    {
      description: 'keeps word-mode units as single runs',
      units: ['One', ' ', 'word'],
      expectedRunTexts: ['One', ' ', 'word'],
    },
  ])('$description', ({ units, expectedRunTexts }) => {
    const runs = groupUnitsIntoWrappableRuns(units);

    const runTexts = runs.map((run) =>
      run.map((unit) => unit.unitText).join('')
    );
    expect(runTexts).toEqual(expectedRunTexts);
  });

  it('preserves the global unit index across runs', () => {
    const runs = groupUnitsIntoWrappableRuns(['H', 'i', ' ', 'y', 'o', 'u']);

    const lastRun = runs[runs.length - 1];
    expect(lastRun.map((unit) => unit.unitIndex)).toEqual([3, 4, 5]);
  });
});
