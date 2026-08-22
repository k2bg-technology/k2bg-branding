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

  it('keeps the sway and zoom within their amplitudes', () => {
    const frames = Array.from({ length: 240 }, (_, frame) => frame);

    const motions = frames.map((frame) =>
      getParallaxMotion({
        frame,
        fps: 30,
        speed: 0.5,
        parallaxAmount: 1,
        dollyAmount: 1,
      })
    );

    const maxParallaxInUv = 0.04;
    const maxZoom = 1.12;
    expect(
      motions.every(
        (motion) =>
          Math.abs(motion.offsetXInUv) <= maxParallaxInUv &&
          Math.abs(motion.offsetYInUv) <= maxParallaxInUv &&
          motion.zoom >= 1 &&
          motion.zoom <= maxZoom
      )
    ).toBe(true);
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
