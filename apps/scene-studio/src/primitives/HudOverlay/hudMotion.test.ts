import { describe, expect, it } from 'vitest';

import { formatTimecode, getHudMarkState } from './hudMotion';

describe('formatTimecode', () => {
  it.each([
    { frame: 0, fps: 30, expected: '00:00:00:00' },
    { frame: 30, fps: 30, expected: '00:00:01:00' },
    { frame: 367, fps: 30, expected: '00:00:12:07' },
    { frame: 1800, fps: 30, expected: '00:01:00:00' },
    { frame: 367, fps: 60, expected: '00:00:06:07' },
    { frame: 216000, fps: 60, expected: '01:00:00:00' },
  ])('formats frame $frame at $fps fps as $expected', ({
    frame,
    fps,
    expected,
  }) => {
    const result = formatTimecode({ frame, fps });

    expect(result).toBe(expected);
  });
});

describe('getHudMarkState', () => {
  it('returns the same state for the same mark and frame', () => {
    const firstResult = getHudMarkState({ markIndex: 5, frame: 42 });
    const secondResult = getHudMarkState({ markIndex: 5, frame: 42 });

    expect(firstResult).toEqual(secondResult);
  });

  it.each([
    { frame: 0 },
    { frame: 97 },
    { frame: 900 },
  ])('keeps the mark inside the frame at frame $frame', ({ frame }) => {
    const result = getHudMarkState({ markIndex: 7, frame });

    expect(result.xInPercent).toBeGreaterThanOrEqual(0);
    expect(result.xInPercent).toBeLessThanOrEqual(100);
    expect(result.yInPercent).toBeGreaterThanOrEqual(0);
    expect(result.yInPercent).toBeLessThanOrEqual(100);
  });

  it.each([
    { frame: 0 },
    { frame: 97 },
    { frame: 900 },
  ])('blinks between the minimum and full opacity at frame $frame', ({
    frame,
  }) => {
    const minimumOpacity = 0.25;

    const result = getHudMarkState({ markIndex: 3, frame });

    expect(result.opacity).toBeGreaterThanOrEqual(minimumOpacity);
    expect(result.opacity).toBeLessThanOrEqual(1);
  });

  it('keeps the mark kind stable while the frame advances', () => {
    const kinds = [0, 15, 240].map(
      (frame) => getHudMarkState({ markIndex: 4, frame, seed: 2 }).kind
    );

    expect(new Set(kinds).size).toBe(1);
  });

  it('relocates marks when the seed changes', () => {
    const defaultSeedMark = getHudMarkState({ markIndex: 1, frame: 0 });
    const reseededMark = getHudMarkState({ markIndex: 1, frame: 0, seed: 9 });

    expect(defaultSeedMark.xInPercent).not.toBeCloseTo(reseededMark.xInPercent);
    expect(defaultSeedMark.yInPercent).not.toBeCloseTo(reseededMark.yInPercent);
  });

  it('places distinct marks at distinct positions', () => {
    const firstMark = getHudMarkState({ markIndex: 1, frame: 0 });
    const secondMark = getHudMarkState({ markIndex: 2, frame: 0 });

    expect(firstMark.xInPercent).not.toBeCloseTo(secondMark.xInPercent);
    expect(firstMark.yInPercent).not.toBeCloseTo(secondMark.yInPercent);
  });
});
