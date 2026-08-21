import { describe, expect, it } from 'vitest';

import {
  getDirectionalStepInUv,
  MAX_SMEAR_IN_SCREEN,
  TAP_COUNT,
} from './blurStep';

const PORTRAIT_ASPECT = 1080 / 1920;
const FULL_STEP_IN_SCREEN = MAX_SMEAR_IN_SCREEN / (TAP_COUNT - 1);

describe('getDirectionalStepInUv', () => {
  it.each([
    { angleInDegrees: 0 },
    { angleInDegrees: 45 },
    { angleInDegrees: 90 },
  ])(
    'returns an exact zero step at amount 0 with angle $angleInDegrees',
    ({ angleInDegrees }) => {
      const step = getDirectionalStepInUv({
        amount: 0,
        angleInDegrees,
        canvasAspect: PORTRAIT_ASPECT,
      });

      expect(step.x).toBe(0);
      expect(step.y).toBe(0);
    }
  );

  it('smears along x and widens it by the canvas aspect at angle 0', () => {
    const step = getDirectionalStepInUv({
      amount: 1,
      angleInDegrees: 0,
      canvasAspect: PORTRAIT_ASPECT,
    });

    expect(step.x).toBeCloseTo(FULL_STEP_IN_SCREEN / PORTRAIT_ASPECT);
    expect(step.y).toBeCloseTo(0);
  });

  it('smears along y at angle 90', () => {
    const step = getDirectionalStepInUv({
      amount: 1,
      angleInDegrees: 90,
      canvasAspect: PORTRAIT_ASPECT,
    });

    expect(step.x).toBeCloseTo(0);
    expect(step.y).toBeCloseTo(FULL_STEP_IN_SCREEN);
  });

  it.each([{ amount: 0.25 }, { amount: 0.5 }, { amount: 1 }])(
    'scales the step length with amount $amount',
    ({ amount }) => {
      const step = getDirectionalStepInUv({
        amount,
        angleInDegrees: 90,
        canvasAspect: PORTRAIT_ASPECT,
      });

      expect(step.y).toBeCloseTo(amount * FULL_STEP_IN_SCREEN);
    }
  );

  it('clamps amount into the unit range', () => {
    const step = getDirectionalStepInUv({
      amount: 2,
      angleInDegrees: 90,
      canvasAspect: PORTRAIT_ASPECT,
    });

    expect(step.y).toBeCloseTo(FULL_STEP_IN_SCREEN);
  });

  it.each([
    { angleInDegrees: 0 },
    { angleInDegrees: 30 },
    { angleInDegrees: 135 },
  ])(
    'keeps the full smear length at angle $angleInDegrees on a square canvas',
    ({ angleInDegrees }) => {
      const step = getDirectionalStepInUv({
        amount: 1,
        angleInDegrees,
        canvasAspect: 1,
      });

      const smearLength = Math.hypot(step.x, step.y) * (TAP_COUNT - 1);
      expect(smearLength).toBeCloseTo(MAX_SMEAR_IN_SCREEN);
    }
  );
});
