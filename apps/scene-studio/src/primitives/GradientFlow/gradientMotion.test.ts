import { describe, expect, it } from 'vitest';

import { getGradientTime } from './gradientMotion';

describe('getGradientTime', () => {
  it('starts at zero on the first frame', () => {
    const time = getGradientTime({ frame: 0, fps: 30 });

    expect(time).toBe(0);
  });

  it.each([
    { earlierFrame: 0, laterFrame: 15 },
    { earlierFrame: 15, laterFrame: 90 },
    { earlierFrame: 90, laterFrame: 9000 },
  ])('advances monotonically between frame $earlierFrame and $laterFrame', ({
    earlierFrame,
    laterFrame,
  }) => {
    const earlierTime = getGradientTime({ frame: earlierFrame, fps: 30 });
    const laterTime = getGradientTime({ frame: laterFrame, fps: 30 });

    expect(laterTime).toBeGreaterThan(earlierTime);
  });

  it('advances at the same speed regardless of the frame rate', () => {
    const timeAtThirtyFps = getGradientTime({ frame: 30, fps: 30 });
    const timeAtSixtyFps = getGradientTime({ frame: 60, fps: 60 });

    expect(timeAtThirtyFps).toBeCloseTo(timeAtSixtyFps);
  });
});
