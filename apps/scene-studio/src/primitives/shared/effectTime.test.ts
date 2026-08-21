import { describe, expect, it } from 'vitest';

import { getEffectTimeInSeconds } from './effectTime';

describe('getEffectTimeInSeconds', () => {
  it('starts at zero on the first frame', () => {
    const time = getEffectTimeInSeconds({ frame: 0, fps: 30 });

    expect(time).toBe(0);
  });

  it('advances monotonically with the frame', () => {
    const earlierTime = getEffectTimeInSeconds({ frame: 15, fps: 30 });
    const laterTime = getEffectTimeInSeconds({ frame: 90, fps: 30 });

    expect(laterTime).toBeGreaterThan(earlierTime);
  });

  it('advances at the same speed regardless of the frame rate', () => {
    const timeAtThirtyFps = getEffectTimeInSeconds({ frame: 30, fps: 30 });
    const timeAtSixtyFps = getEffectTimeInSeconds({ frame: 60, fps: 60 });

    expect(timeAtThirtyFps).toBeCloseTo(timeAtSixtyFps);
  });
});
