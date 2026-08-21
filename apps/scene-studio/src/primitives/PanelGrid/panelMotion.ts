import { Easing, interpolate } from 'remotion';

import { durationsInFrames } from '../../tokens/motion';

export type PanelEnterFrom = 'left' | 'right' | 'alternate';

// Slightly past the panel width so the slide starts fully outside its cell.
const PANEL_TRAVEL_IN_PERCENT = 110;

interface PanelEnterDirectionInput {
  panelIndex: number;
  enterFrom: PanelEnterFrom;
}

export function getPanelEnterDirection({
  panelIndex,
  enterFrom,
}: PanelEnterDirectionInput): -1 | 1 {
  if (enterFrom === 'left') {
    return -1;
  }
  if (enterFrom === 'right') {
    return 1;
  }

  return panelIndex % 2 === 0 ? -1 : 1;
}

interface PanelMotionInput {
  panelIndex: number;
  frame: number;
  enterDelayInFrames: number;
  staggerInFrames: number;
  enterFrom: PanelEnterFrom;
  exitAtFrame?: number;
}

export function getPanelMotion({
  panelIndex,
  frame,
  enterDelayInFrames,
  staggerInFrames,
  enterFrom,
  exitAtFrame,
}: PanelMotionInput) {
  const direction = getPanelEnterDirection({ panelIndex, enterFrom });
  const enterStartFrame = enterDelayInFrames + panelIndex * staggerInFrames;

  const enter = interpolate(
    frame - enterStartFrame,
    [0, durationsInFrames.enter],
    [0, 1],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  // The fade finishes halfway through the slide so the panel is readable
  // while it is still settling.
  const enterOpacity = interpolate(
    frame - enterStartFrame,
    [0, durationsInFrames.enter / 2],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const exitStartFrame =
    exitAtFrame === undefined
      ? undefined
      : exitAtFrame + panelIndex * staggerInFrames;
  const exit =
    exitStartFrame === undefined
      ? 1
      : interpolate(
          frame,
          [exitStartFrame, exitStartFrame + durationsInFrames.fast],
          [1, 0],
          {
            easing: Easing.in(Easing.cubic),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }
        );

  return {
    translateXInPercent:
      direction * PANEL_TRAVEL_IN_PERCENT * Math.max(1 - enter, 1 - exit),
    opacity: Math.min(enterOpacity, exit),
  };
}
