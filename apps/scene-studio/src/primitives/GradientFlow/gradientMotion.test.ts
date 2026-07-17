import { describe, expect, it } from 'vitest';

import { getGradientTime } from './gradientMotion';

describe('getGradientTime', () => {
  it('starts at zero on the first frame', () => {
    const time = getGradientTime({ frame: 0, fps: 30 });

    expect(time).toBe(0);
  });

  it.each([
    { frame: 15 },
    { frame: 90 },
    { frame: 300 },
    { frame: 9000 },
  ])('stays within [-1, 1] at frame $frame', ({ frame }) => {
    const time = getGradientTime({ frame, fps: 30 });

    expect(time).toBeGreaterThanOrEqual(-1);
    expect(time).toBeLessThanOrEqual(1);
  });

  it('advances at the same speed regardless of the frame rate', () => {
    const timeAtThirtyFps = getGradientTime({ frame: 30, fps: 30 });
    const timeAtSixtyFps = getGradientTime({ frame: 60, fps: 60 });

    expect(timeAtThirtyFps).toBeCloseTo(timeAtSixtyFps);
  });
});
