import { clampUnit } from '../../utils/clampUnit';

// Bloom kernel radius in screen-height units at amount = 1. Kept small
// relative to TAP_COUNT so the sparse disc reads as glow, not ghost copies.
export const MAX_BLOOM_RADIUS_IN_SCREEN = 0.05;
// Bloom contribution multiplier at amount = 1.
export const MAX_BLOOM_GAIN = 1.4;
// Samples on the golden-angle disc; the shader unrolls this same list.
export const TAP_COUNT = 32;

const GOLDEN_ANGLE_IN_RADIANS = Math.PI * (3 - Math.sqrt(5));

// Golden-angle spiral fills the disc evenly with few taps; the innermost tap
// sits near the center so bright pixels also bloom onto themselves.
export function getBloomTapOffsets(): ReadonlyArray<{ x: number; y: number }> {
  return Array.from({ length: TAP_COUNT }, (_, tapIndex) => {
    const radius = Math.sqrt((tapIndex + 0.5) / TAP_COUNT);
    const angleInRadians = tapIndex * GOLDEN_ANGLE_IN_RADIANS;

    return {
      x: radius * Math.cos(angleInRadians),
      y: radius * Math.sin(angleInRadians),
    };
  });
}

// The kernel is measured in screen space (height units) so it reads as a true
// circle on screen; only the x component converts back into UV space.
export function getBloomRadiusInUv(input: {
  amount: number;
  canvasAspect: number;
}): { x: number; y: number } {
  const radiusInScreen = clampUnit(input.amount) * MAX_BLOOM_RADIUS_IN_SCREEN;

  return {
    x: radiusInScreen / input.canvasAspect,
    y: radiusInScreen,
  };
}

export function getBloomGain(amount: number): number {
  return clampUnit(amount) * MAX_BLOOM_GAIN;
}
