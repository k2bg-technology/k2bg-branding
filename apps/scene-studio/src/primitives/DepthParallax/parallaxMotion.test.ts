import { describe, expect, it } from 'vitest';

import { getParallaxMotion } from './parallaxMotion';

describe('getParallaxMotion', () => {
  it('rests at the exact identity with zero amounts', () => {
    const motion = getParallaxMotion({
      frame: 77,
      fps: 30,
      speed: 0.25,
      parallaxAmount: 0,
      dollyAmount: 0,
    });

    // Strict equality treats -0 as 0, unlike Object.is-based matchers.
    expect(motion.offsetXInUv === 0).toBe(true);
    expect(motion.offsetYInUv === 0).toBe(true);
    expect(motion.zoom).toBe(1);
  });

  it('starts the push-in from the untouched frame', () => {
    const motion = getParallaxMotion({
      frame: 0,
      fps: 30,
      speed: 0.25,
      parallaxAmount: 1,
      dollyAmount: 1,
    });

    expect(motion.offsetXInUv).toBe(0);
    expect(motion.zoom).toBe(1);
  });

  it('scales sway and zoom with amount and clamps amounts above one', () => {
    const input = { frame: 20, fps: 30, speed: 0.5 };

    const fullMotion = getParallaxMotion({
      ...input,
      parallaxAmount: 1,
      dollyAmount: 1,
    });
    const halfMotion = getParallaxMotion({
      ...input,
      parallaxAmount: 0.5,
      dollyAmount: 0.5,
    });
    const clampedMotion = getParallaxMotion({
      ...input,
      parallaxAmount: 1.5,
      dollyAmount: 1.5,
    });

    expect(fullMotion.offsetXInUv).not.toBe(0);
    expect(fullMotion.offsetYInUv).not.toBe(0);
    expect(fullMotion.zoom).toBeGreaterThan(1);
    expect(halfMotion.offsetXInUv).toBeCloseTo(fullMotion.offsetXInUv / 2, 6);
    expect(halfMotion.offsetYInUv).toBeCloseTo(fullMotion.offsetYInUv / 2, 6);
    expect(halfMotion.zoom - 1).toBeCloseTo((fullMotion.zoom - 1) / 2, 6);
    expect(clampedMotion).toEqual(fullMotion);
  });

  it('sways at the same pace regardless of the frame rate', () => {
    const atThirtyFps = getParallaxMotion({
      frame: 30,
      fps: 30,
      speed: 0.25,
      parallaxAmount: 1,
      dollyAmount: 1,
    });
    const atSixtyFps = getParallaxMotion({
      frame: 60,
      fps: 60,
      speed: 0.25,
      parallaxAmount: 1,
      dollyAmount: 1,
    });

    expect(atThirtyFps.offsetXInUv).toBeCloseTo(atSixtyFps.offsetXInUv);
    expect(atThirtyFps.zoom).toBeCloseTo(atSixtyFps.zoom);
  });
});
