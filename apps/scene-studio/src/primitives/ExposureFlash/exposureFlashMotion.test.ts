import { describe, expect, it } from 'vitest';

import {
  getBackdropBlurInPx,
  getBackdropBrightness,
  getWashColor,
  getWashOpacity,
  MAX_BACKDROP_BLUR_IN_PX,
} from './exposureFlashMotion';

const PURE_WHITE = 'rgb(255, 255, 255)';

describe('getWashOpacity', () => {
  it.each([
    { intensity: 0, expected: 0 },
    { intensity: 1, expected: 1 },
    { intensity: -0.4, expected: 0 },
    { intensity: 1.4, expected: 1 },
  ])('reaches exactly $expected at intensity $intensity', ({
    intensity,
    expected,
  }) => {
    const result = getWashOpacity(intensity);

    expect(result).toBe(expected);
  });

  it('lags behind the linear ramp at mid intensity', () => {
    const midIntensity = 0.5;

    const result = getWashOpacity(midIntensity);

    expect(result).toBeLessThan(midIntensity);
  });
});

describe('getBackdropBrightness', () => {
  it('returns the identity brightness at intensity 0', () => {
    const result = getBackdropBrightness(0);

    expect(result).toBe(1);
  });

  it.each([
    { lowerIntensity: 0, higherIntensity: 0.3 },
    { lowerIntensity: 0.3, higherIntensity: 0.7 },
    { lowerIntensity: 0.7, higherIntensity: 1 },
  ])('brightens more at intensity $higherIntensity than at $lowerIntensity', ({
    lowerIntensity,
    higherIntensity,
  }) => {
    const lowerBrightness = getBackdropBrightness(lowerIntensity);
    const higherBrightness = getBackdropBrightness(higherIntensity);

    expect(higherBrightness).toBeGreaterThan(lowerBrightness);
  });
});

describe('getBackdropBlurInPx', () => {
  it('applies no blur at intensity 0', () => {
    const result = getBackdropBlurInPx(0);

    expect(result).toBe(0);
  });

  it('reaches the maximum blur at intensity 1', () => {
    const result = getBackdropBlurInPx(1);

    expect(result).toBe(MAX_BACKDROP_BLUR_IN_PX);
  });
});

describe('getWashColor', () => {
  it.each([
    { tint: 'neutral' as const },
    { tint: 'warm' as const },
  ])('converges to pure white at intensity 1 for the $tint tint', ({
    tint,
  }) => {
    const result = getWashColor({ tint, intensity: 1 });

    expect(result).toBe(PURE_WHITE);
  });

  it('starts from the warm tint color at intensity 0', () => {
    const result = getWashColor({ tint: 'warm', intensity: 0 });

    expect(result).toBe('rgb(255, 236, 214)');
  });
});
