import { describe, expect, it } from 'vitest';

import { getScanlineOffsetInPx } from './scanlineMotion';

describe('getScanlineOffsetInPx', () => {
  it('starts with no offset on the first frame', () => {
    const offset = getScanlineOffsetInPx({
      frame: 0,
      fps: 30,
      driftSpeedInPxPerSecond: 12,
      spacingInPx: 6,
    });

    expect(offset).toBe(0);
  });

  it('travels at the drift speed', () => {
    const offset = getScanlineOffsetInPx({
      frame: 15,
      fps: 30,
      driftSpeedInPxPerSecond: 8,
      spacingInPx: 6,
    });

    const expectedOffset = 4;
    expect(offset).toBeCloseTo(expectedOffset);
  });

  it('wraps within one line period', () => {
    const offset = getScanlineOffsetInPx({
      frame: 300,
      fps: 30,
      driftSpeedInPxPerSecond: 100,
      spacingInPx: 6,
    });

    expect(offset).toBeGreaterThanOrEqual(0);
    expect(offset).toBeLessThan(6);
  });

  it('stays put without drift', () => {
    const offset = getScanlineOffsetInPx({
      frame: 120,
      fps: 30,
      driftSpeedInPxPerSecond: 0,
      spacingInPx: 6,
    });

    expect(offset).toBe(0);
  });
});
