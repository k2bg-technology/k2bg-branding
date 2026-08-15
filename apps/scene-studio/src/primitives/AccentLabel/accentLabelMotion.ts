import { Easing, interpolate } from 'remotion';

import { durationsInFrames, easings } from '../../tokens/motion';

// The bar leads and the text trails, so the bar reads as revealing the text.
export const TEXT_LAG_IN_FRAMES = 6;

const TEXT_OFFSET_IN_PX = 24;

const CLAMP_OPTIONS = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

interface AccentLabelMotionInput {
  frame: number;
  enterDelayInFrames: number;
}

export function getAccentLabelMotion({
  frame,
  enterDelayInFrames,
}: AccentLabelMotionInput) {
  const easing = Easing.bezier(...easings.emphasized);

  const barScale = interpolate(
    frame - enterDelayInFrames,
    [0, durationsInFrames.enter],
    [0, 1],
    { ...CLAMP_OPTIONS, easing }
  );
  const textProgress = interpolate(
    frame - enterDelayInFrames - TEXT_LAG_IN_FRAMES,
    [0, durationsInFrames.enter],
    [0, 1],
    { ...CLAMP_OPTIONS, easing }
  );

  return {
    barScale,
    textOpacity: textProgress,
    textTranslateXInPx: (1 - textProgress) * TEXT_OFFSET_IN_PX,
  };
}
