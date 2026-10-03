import { describe, expect, it } from 'vitest';

import {
  getDollyDistance,
  getPlaneOpacity,
  getPlanePlacement,
} from './depthMotion';

describe('getDollyDistance', () => {
  it('returns the same distance for the same input', () => {
    const input = { frame: 40, durationInFrames: 150, planeCount: 4 };

    const firstResult = getDollyDistance(input);
    const secondResult = getDollyDistance(input);

    expect(firstResult).toBe(secondResult);
  });

  it('starts at zero on the first frame', () => {
    const distance = getDollyDistance({
      frame: 0,
      durationInFrames: 150,
      planeCount: 4,
    });

    expect(distance).toBe(0);
  });

  it('reaches the full corridor length on the last frame', () => {
    const planeCount = 4;

    const distance = getDollyDistance({
      frame: 149,
      durationInFrames: 150,
      planeCount,
    });

    const fullCorridorLength = 7.5;
    expect(distance).toBeCloseTo(fullCorridorLength);
  });

  it('never moves backwards between representative frames', () => {
    const durationInFrames = 150;
    const planeCount = 4;

    const earlierDistance = getDollyDistance({
      frame: 30,
      durationInFrames,
      planeCount,
    });
    const laterDistance = getDollyDistance({
      frame: 75,
      durationInFrames,
      planeCount,
    });

    expect(laterDistance).toBeGreaterThanOrEqual(earlierDistance);
  });

  it.each([
    { frame: -5, expectedDistance: 0 },
    { frame: 200, expectedDistance: 7.5 },
  ])(
    'clamps out-of-range frame $frame to $expectedDistance',
    ({ frame, expectedDistance }) => {
      const distance = getDollyDistance({
        frame,
        durationInFrames: 150,
        planeCount: 4,
      });

      expect(distance).toBeCloseTo(expectedDistance);
    }
  );
});

describe('getPlanePlacement', () => {
  it('returns the same placement for the same plane index', () => {
    const firstResult = getPlanePlacement({ planeIndex: 2 });
    const secondResult = getPlanePlacement({ planeIndex: 2 });

    expect(firstResult).toEqual(secondResult);
  });

  it('spaces consecutive planes 2.5 world units apart in depth', () => {
    const placement = getPlanePlacement({ planeIndex: 1 });
    const nextPlacement = getPlanePlacement({ planeIndex: 2 });

    expect(placement.z - nextPlacement.z).toBeCloseTo(2.5);
  });

  it('alternates the lateral side between consecutive planes', () => {
    const evenPlacement = getPlanePlacement({ planeIndex: 0 });
    const oddPlacement = getPlanePlacement({ planeIndex: 1 });

    expect(Math.sign(evenPlacement.x)).toBe(-Math.sign(oddPlacement.x));
  });

  it.each([{ planeIndex: 0 }, { planeIndex: 1 }])(
    'keeps plane $planeIndex within the lateral offset bound',
    ({ planeIndex }) => {
      const placement = getPlanePlacement({ planeIndex });

      expect(Math.abs(placement.x)).toBeLessThanOrEqual(0.6);
    }
  );
});

describe('getPlaneOpacity', () => {
  it.each([
    {
      description: 'a plane far beyond the fade range',
      planeZ: -10,
      dollyDistance: 0,
      expectedOpacity: 0,
    },
    {
      description: 'a plane fully in view',
      planeZ: -2.5,
      dollyDistance: 0,
      expectedOpacity: 1,
    },
    {
      description: 'a plane that has passed the camera',
      planeZ: -2.5,
      dollyDistance: 5,
      expectedOpacity: 0,
    },
  ])(
    'returns $expectedOpacity for $description',
    ({ planeZ, dollyDistance, expectedOpacity }) => {
      const opacity = getPlaneOpacity({ planeZ, dollyDistance });

      expect(opacity).toBeCloseTo(expectedOpacity);
    }
  );

  it('fades a plane in while it approaches from the far distance', () => {
    const opacity = getPlaneOpacity({ planeZ: -7.5, dollyDistance: 0 });

    expect(opacity).toBeGreaterThan(0);
    expect(opacity).toBeLessThan(1);
  });

  it('fades a plane out while it slips past the camera', () => {
    const opacity = getPlaneOpacity({ planeZ: -2.5, dollyDistance: 1.8 });

    expect(opacity).toBeGreaterThan(0);
    expect(opacity).toBeLessThan(1);
  });
});
