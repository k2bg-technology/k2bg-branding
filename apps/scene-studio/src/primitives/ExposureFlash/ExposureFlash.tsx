import { AbsoluteFill } from 'remotion';

import { clampUnit } from '../../utils/clampUnit';
import {
  type FlashTint,
  getBackdropBlurInPx,
  getBackdropBrightness,
  getWashColor,
  getWashOpacity,
} from './exposureFlashMotion';

export type { FlashTint } from './exposureFlashMotion';

interface Props {
  intensity: number;
  tint?: FlashTint;
  className?: string;
}

// An exposure burst meant to sit above a scene and span a hard cut:
// intensity 0 renders nothing and intensity 1 is a solid white frame, so a
// swap underneath stays hidden at the peak. The backdrop layer leads by
// blowing out and blooming the footage itself; the wash catches up to white.
export function ExposureFlash({
  intensity,
  tint = 'neutral',
  className,
}: Props) {
  const clampedIntensity = clampUnit(intensity);
  if (clampedIntensity <= 0) {
    return null;
  }

  const backdropFilter = `brightness(${getBackdropBrightness(clampedIntensity)}) blur(${getBackdropBlurInPx(clampedIntensity)}px)`;

  return (
    <AbsoluteFill aria-hidden className={className}>
      <AbsoluteFill
        style={{
          backdropFilter,
          WebkitBackdropFilter: backdropFilter,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: getWashColor({ tint, intensity: clampedIntensity }),
          opacity: getWashOpacity(clampedIntensity),
        }}
      />
    </AbsoluteFill>
  );
}
