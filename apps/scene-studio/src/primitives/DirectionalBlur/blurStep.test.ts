import { describe, expect, it } from 'vitest';

import { getDirectionalStepInUv } from './blurStep';

const PORTRAIT_ASPECT = 1080 / 1920;

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
    const portraitStep = getDirectionalStepInUv({
      amount: 1,
      angleInDegrees: 0,
      canvasAspect: PORTRAIT_ASPECT,
    });
    const squareStep = getDirectionalStepInUv({
      amount: 1,
      angleInDegrees: 0,
      canvasAspect: 1,
    });

    expect(portraitStep.x).toBeGreaterThan(0);
    expect(portraitStep.x * PORTRAIT_ASPECT).toBeCloseTo(squareStep.x);
    expect(portraitStep.y).toBeCloseTo(0);
  });

  it('smears along y at angle 90', () => {
    const step = getDirectionalStepInUv({
      amount: 1,
      angleInDegrees: 90,
      canvasAspect: PORTRAIT_ASPECT,
    });

    expect(step.x).toBeCloseTo(0);
    expect(step.y).toBeGreaterThan(Math.abs(step.x));
  });

  it('scales the step length in proportion to amount', () => {
    const halfStep = getDirectionalStepInUv({
      amount: 0.5,
      angleInDegrees: 90,
      canvasAspect: PORTRAIT_ASPECT,
    });
    const fullStep = getDirectionalStepInUv({
      amount: 1,
      angleInDegrees: 90,
      canvasAspect: PORTRAIT_ASPECT,
    });

    expect(halfStep.y).toBeCloseTo(fullStep.y / 2, 6);
  });

  it('clamps amount into the unit range', () => {
    const excessiveStep = getDirectionalStepInUv({
      amount: 2,
      angleInDegrees: 90,
      canvasAspect: PORTRAIT_ASPECT,
    });
    const fullStep = getDirectionalStepInUv({
      amount: 1,
      angleInDegrees: 90,
      canvasAspect: PORTRAIT_ASPECT,
    });
    const negativeStep = getDirectionalStepInUv({
      amount: -0.5,
      angleInDegrees: 90,
      canvasAspect: PORTRAIT_ASPECT,
    });

    expect(excessiveStep).toEqual(fullStep);
    expect(negativeStep).toEqual({ x: 0, y: 0 });
  });

  it('keeps the full smear length at any angle on a square canvas', () => {
    const horizontalStep = getDirectionalStepInUv({
      amount: 1,
      angleInDegrees: 0,
      canvasAspect: 1,
    });
    const diagonalStep = getDirectionalStepInUv({
      amount: 1,
      angleInDegrees: 135,
      canvasAspect: 1,
    });

    expect(Math.hypot(diagonalStep.x, diagonalStep.y)).toBeCloseTo(
      Math.hypot(horizontalStep.x, horizontalStep.y),
      6
    );
  });
});
