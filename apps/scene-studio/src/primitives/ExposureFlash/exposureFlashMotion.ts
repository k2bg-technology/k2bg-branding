import { clampUnit } from '../../utils/clampUnit';

// Backdrop brightness boost above identity at intensity 1.
export const MAX_BACKDROP_BRIGHTNESS_BOOST = 2.5;
// Backdrop blur radius at intensity 1.
export const MAX_BACKDROP_BLUR_IN_PX = 24;

export type FlashTint = 'neutral' | 'warm';

const TINT_COLORS: Record<
  FlashTint,
  { red: number; green: number; blue: number }
> = {
  neutral: { red: 255, green: 255, blue: 255 },
  warm: { red: 255, green: 236, blue: 214 },
};

// The wash lags behind the backdrop bloom so the flash reads as light
// swelling out of the footage before the frame whites out.
export function getWashOpacity(intensity: number): number {
  const clampedIntensity = clampUnit(intensity);

  return clampedIntensity * clampedIntensity;
}

export function getBackdropBrightness(intensity: number): number {
  return 1 + clampUnit(intensity) * MAX_BACKDROP_BRIGHTNESS_BOOST;
}

export function getBackdropBlurInPx(intensity: number): number {
  return clampUnit(intensity) * MAX_BACKDROP_BLUR_IN_PX;
}

// The tint converges to pure white at intensity 1 so the peak frame fully
// masks the cut underneath regardless of tint.
export function getWashColor(input: {
  tint: FlashTint;
  intensity: number;
}): string {
  const clampedIntensity = clampUnit(input.intensity);
  const tintColor = TINT_COLORS[input.tint];
  const toWhite = (channel: number) =>
    Math.round(channel + (255 - channel) * clampedIntensity);

  return `rgb(${toWhite(tintColor.red)}, ${toWhite(tintColor.green)}, ${toWhite(tintColor.blue)})`;
}
