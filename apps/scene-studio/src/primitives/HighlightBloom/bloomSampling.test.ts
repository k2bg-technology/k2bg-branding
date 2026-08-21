import { describe, expect, it } from 'vitest';

import {
  getBloomGain,
  getBloomRadiusInUv,
  getBloomTapOffsets,
  MAX_BLOOM_GAIN,
  MAX_BLOOM_RADIUS_IN_SCREEN,
  TAP_COUNT,
} from './bloomSampling';

const CANVAS_ASPECT = 1080 / 1920;

describe('getBloomTapOffsets', () => {
  it('returns one offset per shader tap', () => {
    const result = getBloomTapOffsets();

    expect(result).toHaveLength(TAP_COUNT);
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

  it.each([
    { amount: 1 },
    { amount: 1.6 },
  ])('caps the radius at the maximum for amount $amount', ({ amount }) => {
    const result = getBloomRadiusInUv({ amount, canvasAspect: CANVAS_ASPECT });

    expect(result.y).toBeCloseTo(MAX_BLOOM_RADIUS_IN_SCREEN);
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

  it.each([
    { amount: 1, expected: MAX_BLOOM_GAIN },
    { amount: 2, expected: MAX_BLOOM_GAIN },
    { amount: -0.5, expected: 0 },
  ])('clamps amount $amount to a gain of $expected', ({ amount, expected }) => {
    const result = getBloomGain(amount);

    expect(result).toBeCloseTo(expected);
  });
});
