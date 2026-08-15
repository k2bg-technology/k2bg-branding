import { describe, expect, it } from 'vitest';

import { getBandProgress, getWipeClipPathPolygon } from './blockWipeMotion';

const CANVAS_ASPECT = 1080 / 1920;

type PolygonPoint = [number, number];

function parsePolygonPoints(clipPath: string): PolygonPoint[] {
  return clipPath
    .replace('polygon(', '')
    .replace(')', '')
    .split(',')
    .map((vertex) => {
      const [xInPercent, yInPercent] = vertex.trim().split(' ');

      return [Number.parseFloat(xInPercent), Number.parseFloat(yInPercent)];
    });
}

// Sutherland–Hodgman starts the ring at a different corner per angle, so
// comparisons sort the vertices to stay independent of that rotation.
function parseSortedPolygonPoints(clipPath: string): PolygonPoint[] {
  return parsePolygonPoints(clipPath).sort(
    ([firstX, firstY], [secondX, secondY]) =>
      firstX - secondX || firstY - secondY
  );
}

const FULL_RECTANGLE: PolygonPoint[] = [
  [0, 0],
  [0, 100],
  [100, 0],
  [100, 100],
];

describe('getBandProgress', () => {
  const bandCount = 3;
  const staggerShare = 0.18;

  it.each([
    { bandIndex: 0 },
    { bandIndex: 1 },
    { bandIndex: 2 },
  ])('leaves band $bandIndex uncovered at coverage 0', ({ bandIndex }) => {
    const result = getBandProgress({
      bandIndex,
      bandCount,
      coverage: 0,
      staggerShare,
    });

    expect(result).toBe(0);
  });

  it.each([
    { bandIndex: 0 },
    { bandIndex: 1 },
    { bandIndex: 2 },
  ])('fills band $bandIndex completely at coverage 1', ({ bandIndex }) => {
    const result = getBandProgress({
      bandIndex,
      bandCount,
      coverage: 1,
      staggerShare,
    });

    expect(result).toBe(1);
  });

  it('lags each band behind the previous one by the stagger share', () => {
    const coverage = 0.5;

    const leadingProgress = getBandProgress({
      bandIndex: 0,
      bandCount,
      coverage,
      staggerShare,
    });
    const trailingProgress = getBandProgress({
      bandIndex: 1,
      bandCount,
      coverage,
      staggerShare,
    });

    expect(leadingProgress - trailingProgress).toBeCloseTo(staggerShare);
  });

  it.each([
    { coverage: 0.37, expected: 0.37 },
    { coverage: 1.4, expected: 1 },
    { coverage: -0.2, expected: 0 },
  ])('returns the clamped coverage $coverage for a single band', ({
    coverage,
    expected,
  }) => {
    const result = getBandProgress({
      bandIndex: 0,
      bandCount: 1,
      coverage,
      staggerShare,
    });

    expect(result).toBeCloseTo(expected);
  });
});

describe('getWipeClipPathPolygon', () => {
  it.each([
    {
      description: 'covers the left half when travelling rightward',
      directionInDegrees: 0,
      expectedPoints: [
        [0, 0],
        [0, 100],
        [50, 0],
        [50, 100],
      ],
    },
    {
      description: 'covers the top half when travelling downward',
      directionInDegrees: 90,
      expectedPoints: [
        [0, 0],
        [0, 50],
        [100, 0],
        [100, 50],
      ],
    },
    {
      description: 'covers the right half when travelling leftward',
      directionInDegrees: 180,
      expectedPoints: [
        [50, 0],
        [50, 100],
        [100, 0],
        [100, 100],
      ],
    },
    {
      description: 'covers the bottom half when travelling upward',
      directionInDegrees: 270,
      expectedPoints: [
        [0, 50],
        [0, 100],
        [100, 50],
        [100, 100],
      ],
    },
  ])('$description', ({ directionInDegrees, expectedPoints }) => {
    const result = getWipeClipPathPolygon({
      progress: 0.5,
      directionInDegrees,
      canvasAspect: CANVAS_ASPECT,
    });

    expect(parseSortedPolygonPoints(result)).toEqual(expectedPoints);
  });

  it.each([
    { directionInDegrees: 0 },
    { directionInDegrees: 25 },
    { directionInDegrees: 90 },
    { directionInDegrees: 137 },
    { directionInDegrees: 180 },
    { directionInDegrees: 315 },
  ])('covers the whole frame at progress 1 travelling at $directionInDegrees degrees', ({
    directionInDegrees,
  }) => {
    const result = getWipeClipPathPolygon({
      progress: 1,
      directionInDegrees,
      canvasAspect: CANVAS_ASPECT,
    });

    expect(parseSortedPolygonPoints(result)).toEqual(FULL_RECTANGLE);
  });

  it.each([
    { directionInDegrees: 25, progress: 0.1 },
    { directionInDegrees: 25, progress: 0.75 },
    { directionInDegrees: 137, progress: 0.35 },
    { directionInDegrees: 205, progress: 0.5 },
    { directionInDegrees: 315, progress: 0.9 },
    { directionInDegrees: 315, progress: 1 },
  ])('keeps every vertex inside the frame at $directionInDegrees degrees and progress $progress', ({
    directionInDegrees,
    progress,
  }) => {
    const result = getWipeClipPathPolygon({
      progress,
      directionInDegrees,
      canvasAspect: CANVAS_ASPECT,
    });

    const coordinates = parsePolygonPoints(result).flat();
    expect(Math.min(...coordinates)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...coordinates)).toBeLessThanOrEqual(100);
  });

  it('collapses to an empty polygon at progress 0', () => {
    const expectedEmptyPolygon = 'polygon(0% 0%, 0% 0%, 0% 0%)';

    const result = getWipeClipPathPolygon({
      progress: 0,
      directionInDegrees: 25,
      canvasAspect: CANVAS_ASPECT,
    });

    expect(result).toBe(expectedEmptyPolygon);
  });
});
