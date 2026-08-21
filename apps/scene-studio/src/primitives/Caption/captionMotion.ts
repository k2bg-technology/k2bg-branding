import { interpolate } from 'remotion';

import { durationsInFrames } from '../../tokens/motion';

interface CaptionMotionInput {
  frame: number;
  enterDelayInFrames: number;
  exitAtFrame?: number;
}

export function getCaptionMotion({
  frame,
  enterDelayInFrames,
  exitAtFrame,
}: CaptionMotionInput) {
  const enter = interpolate(
    frame - enterDelayInFrames,
    [0, durationsInFrames.enter],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exit =
    exitAtFrame === undefined
      ? 1
      : interpolate(
          frame,
          [exitAtFrame, exitAtFrame + durationsInFrames.fast],
          [1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

  return {
    opacity: Math.min(enter, exit),
    translateYInPx: (1 - enter) * 24,
  };
}
