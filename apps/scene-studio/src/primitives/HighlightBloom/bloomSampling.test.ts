import { describe, expect, it } from 'vitest';

import {
  getBloomGain,
  getBloomRadiusInUv,
  getBloomTapOffsets,
} from './bloomSampling';

const CANVAS_ASPECT = 1080 / 1920;

describe('getBloomTapOffsets', () => {
  it('returns one offset per shader tap', () => {
    const result = getBloomTapOffsets();

    expect(result).toHaveLength(32);
  });

  it('keeps every offset inside the unit disc', () => {
    const result = getBloomTapOffsets();

    const largestDistance = Math.max(
      ...result.map((offset) => Math.hypot(offset.x, offset.y))
    );
    expect(largestDistance).toBeLessThanOrEqual(1);
  });

  it('returns identical offsets on every call', () => {
    const firstCall = getBloomTapOffsets();
    const secondCall = getBloomTapOffsets();

    expect(firstCall).toEqual(secondCall);
  });
});

describe('getBloomRadiusInUv', () => {
  it('collapses to zero at amount 0 so the shader takes the passthrough path', () => {
    const result = getBloomRadiusInUv({
      amount: 0,
      canvasAspect: CANVAS_ASPECT,
    });

    expect(result).toEqual({ x: 0, y: 0 });
  });

  it('caps the radius at the same maximum for amount 1 and above', () => {
    const fullRadius = getBloomRadiusInUv({
      amount: 1,
      canvasAspect: CANVAS_ASPECT,
    });
    const excessiveRadius = getBloomRadiusInUv({
      amount: 1.6,
      canvasAspect: CANVAS_ASPECT,
    });

    expect(fullRadius.y).toBeGreaterThan(0);
    expect(excessiveRadius).toEqual(fullRadius);
  });

  it('converts only the x component into UV space via the canvas aspect', () => {
    const result = getBloomRadiusInUv({
      amount: 0.5,
      canvasAspect: CANVAS_ASPECT,
    });

    expect(result.x).toBeCloseTo(result.y / CANVAS_ASPECT);
  });
});

describe('getBloomGain', () => {
  it('returns exactly zero at amount 0', () => {
    const result = getBloomGain(0);

    expect(result).toBe(0);
  });

  it('clamps gain to the values at amounts 0 and 1', () => {
    const fullGain = getBloomGain(1);

    expect(fullGain).toBeGreaterThan(0);
    expect(getBloomGain(2)).toBe(fullGain);
    expect(getBloomGain(-0.5)).toBe(0);
  });
});
