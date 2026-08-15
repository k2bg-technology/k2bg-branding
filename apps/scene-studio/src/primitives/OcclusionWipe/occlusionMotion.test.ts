import { describe, expect, it } from 'vitest';

import {
  EDGE_SOFTNESS_IN_PX,
  getOcclusionOffset,
  getSilhouetteRotationInDegrees,
  getSilhouetteShape,
  MAX_SILHOUETTE_SCALE,
} from './occlusionMotion';

const FRAME_WIDTH_IN_PX = 1080;
const FRAME_HEIGHT_IN_PX = 1920;

describe('getOcclusionOffset', () => {
  it('centers the silhouette on the frame at progress 0.5', () => {
    const result = getOcclusionOffset({
      progress: 0.5,
      directionInDegrees: 0,
      widthInPx: FRAME_WIDTH_IN_PX,
      heightInPx: FRAME_HEIGHT_IN_PX,
    });

    expect(result).toEqual({ xInPx: 0, yInPx: 0 });
  });

  it.each([
    { directionInDegrees: 0, progress: 0 },
    { directionInDegrees: 0, progress: 1 },
    { directionInDegrees: 90, progress: 0 },
    { directionInDegrees: 90, progress: 1 },
    { directionInDegrees: 180, progress: 0 },
    { directionInDegrees: 180, progress: 1 },
  ])('places the silhouette fully off-screen at progress $progress travelling at $directionInDegrees degrees', ({
    directionInDegrees,
    progress,
  }) => {
    const directionInRadians = (directionInDegrees * Math.PI) / 180;
    const silhouetteHalfDiagonalInPx =
      (MAX_SILHOUETTE_SCALE *
        Math.hypot(FRAME_WIDTH_IN_PX, FRAME_HEIGHT_IN_PX)) /
      2;
    const frameHalfProjectionInPx =
      (Math.abs(FRAME_WIDTH_IN_PX * Math.cos(directionInRadians)) +
        Math.abs(FRAME_HEIGHT_IN_PX * Math.sin(directionInRadians))) /
      2;

    const result = getOcclusionOffset({
      progress,
      directionInDegrees,
      widthInPx: FRAME_WIDTH_IN_PX,
      heightInPx: FRAME_HEIGHT_IN_PX,
    });

    const offsetDistanceInPx = Math.hypot(result.xInPx, result.yInPx);
    expect(offsetDistanceInPx).toBeGreaterThanOrEqual(
      silhouetteHalfDiagonalInPx + frameHalfProjectionInPx + EDGE_SOFTNESS_IN_PX
    );
  });
});

describe('getSilhouetteShape', () => {
  it('returns the same shape for the same seed', () => {
    const seed = 4;

    const firstShape = getSilhouetteShape({ seed });
    const secondShape = getSilhouetteShape({ seed });

    expect(firstShape).toEqual(secondShape);
  });

  it.each([
    { seed: 0 },
    { seed: 1 },
    { seed: 7 },
  ])('oversizes the silhouette beyond the frame for seed $seed', ({ seed }) => {
    const minimumSizeInPercent = 100;

    const result = getSilhouetteShape({ seed });

    expect(result.widthInPercent).toBeGreaterThan(minimumSizeInPercent);
    expect(result.heightInPercent).toBeGreaterThan(minimumSizeInPercent);
  });

  it('keeps every corner radius inside the irregularity bounds', () => {
    const minimumRadiusInPercent = 30;
    const maximumRadiusInPercent = 70;

    const result = getSilhouetteShape({ seed: 2 });

    const cornerRadii = result.borderRadius
      .split(/[\s/]+/)
      .map((radius) => Number.parseFloat(radius));
    expect(Math.min(...cornerRadii)).toBeGreaterThanOrEqual(
      minimumRadiusInPercent
    );
    expect(Math.max(...cornerRadii)).toBeLessThanOrEqual(
      maximumRadiusInPercent
    );
  });
});

describe('getSilhouetteRotationInDegrees', () => {
  it('passes through zero rotation at mid-sweep', () => {
    const result = getSilhouetteRotationInDegrees({ progress: 0.5, seed: 3 });

    // Math.abs folds the -0 the seeded drift direction can produce.
    expect(Math.abs(result)).toBe(0);
  });

  it.each([
    { progress: 0 },
    { progress: 1 },
  ])('stays within the drift bound at progress $progress', ({ progress }) => {
    const maximumDriftInDegrees = 6;

    const result = getSilhouetteRotationInDegrees({ progress, seed: 3 });

    expect(Math.abs(result)).toBeLessThanOrEqual(maximumDriftInDegrees);
  });
});
