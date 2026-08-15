import { describe, expect, it } from 'vitest';

import {
  getDollyDistance,
  getPlaneOpacity,
  getPlanePlacement,
  LATERAL_OFFSET_IN_WORLD_UNITS,
  PLANE_SPACING_IN_WORLD_UNITS,
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

    const fullCorridorLength = (planeCount - 1) * PLANE_SPACING_IN_WORLD_UNITS;
    expect(distance).toBeCloseTo(fullCorridorLength);
  });

  it.each([
    { earlierFrame: 0, laterFrame: 30 },
    { earlierFrame: 30, laterFrame: 75 },
    { earlierFrame: 75, laterFrame: 149 },
  ])(
    'never moves backwards between frame $earlierFrame and $laterFrame',
    ({ earlierFrame, laterFrame }) => {
      const durationInFrames = 150;
      const planeCount = 4;

      const earlierDistance = getDollyDistance({
        frame: earlierFrame,
        durationInFrames,
        planeCount,
      });
      const laterDistance = getDollyDistance({
        frame: laterFrame,
        durationInFrames,
        planeCount,
      });

      expect(laterDistance).toBeGreaterThanOrEqual(earlierDistance);
    }
  );

  it.each([
    { frame: -5, expectedDistance: 0 },
    { frame: 200, expectedDistance: 3 * PLANE_SPACING_IN_WORLD_UNITS },
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

  it.each([{ planeIndex: 0 }, { planeIndex: 1 }, { planeIndex: 2 }])(
    'spaces plane $planeIndex and its successor one spacing apart in depth',
    ({ planeIndex }) => {
      const placement = getPlanePlacement({ planeIndex });
      const nextPlacement = getPlanePlacement({ planeIndex: planeIndex + 1 });

      expect(placement.z - nextPlacement.z).toBeCloseTo(
        PLANE_SPACING_IN_WORLD_UNITS
      );
    }
  );

  it('alternates the lateral side between consecutive planes', () => {
    const evenPlacement = getPlanePlacement({ planeIndex: 0 });
    const oddPlacement = getPlanePlacement({ planeIndex: 1 });

    expect(Math.sign(evenPlacement.x)).toBe(-Math.sign(oddPlacement.x));
  });

  it.each([{ planeIndex: 0 }, { planeIndex: 1 }, { planeIndex: 5 }])(
    'keeps plane $planeIndex within the lateral offset bound',
    ({ planeIndex }) => {
      const placement = getPlanePlacement({ planeIndex });

      expect(Math.abs(placement.x)).toBeLessThanOrEqual(
        LATERAL_OFFSET_IN_WORLD_UNITS
      );
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

  it.each([
    { description: 'extremely far', planeZ: -1000, dollyDistance: 0 },
    { description: 'extremely behind', planeZ: 1000, dollyDistance: 0 },
  ])(
    'stays within [0, 1] for a plane $description',
    ({ planeZ, dollyDistance }) => {
      const opacity = getPlaneOpacity({ planeZ, dollyDistance });

      expect(opacity).toBeGreaterThanOrEqual(0);
      expect(opacity).toBeLessThanOrEqual(1);
    }
  );
});
