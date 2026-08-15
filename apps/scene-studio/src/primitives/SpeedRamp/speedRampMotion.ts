import { clampUnit } from '../../utils/clampUnit';

// Ghosts fade in between these speeds so normal playback stays clean.
export const ECHO_MIN_SPEED = 1;
export const ECHO_FULL_STRENGTH_SPEED = 3;
// Source frames between ghosts per unit of speed above ECHO_MIN_SPEED. Kept
// tight so the ghosts read as one continuous smear, not discrete copies.
export const ECHO_SPACING_FACTOR = 0.45;
export const ECHO_LEAD_OPACITY = 0.45;
export const ECHO_OPACITY_DECAY = 0.7;
// Fuses the discrete ghosts into one smear at full rush speed.
export const MAX_SMEAR_BLUR_IN_PX = 8;
// Preview-only hint; browsers reject rates at 0 or far above realtime.
export const MIN_PLAYBACK_RATE = 0.05;
export const MAX_PLAYBACK_RATE = 16;

export interface SpeedKeyframe {
  atFrame: number;
  speed: number;
}

export interface EchoLayer {
  echoIndex: number;
  sourceOffsetInFrames: number;
  opacity: number;
}

function getInterpolatedSpeed(
  segmentStart: SpeedKeyframe,
  segmentEnd: SpeedKeyframe,
  frame: number
): number {
  const spanInFrames = segmentEnd.atFrame - segmentStart.atFrame;
  if (spanInFrames <= 0) {
    return segmentEnd.speed;
  }
  const progress = (frame - segmentStart.atFrame) / spanInFrames;

  return (
    segmentStart.speed + (segmentEnd.speed - segmentStart.speed) * progress
  );
}

export function getSpeedAtFrame(input: {
  frame: number;
  speedKeyframes: ReadonlyArray<SpeedKeyframe>;
}): number {
  const { frame, speedKeyframes } = input;
  if (speedKeyframes.length === 0) {
    return 1;
  }

  const first = speedKeyframes[0];
  if (frame <= first.atFrame) {
    return first.speed;
  }
  const last = speedKeyframes[speedKeyframes.length - 1];
  if (frame >= last.atFrame) {
    return last.speed;
  }

  for (let index = 0; index < speedKeyframes.length - 1; index++) {
    const segmentEnd = speedKeyframes[index + 1];
    if (frame <= segmentEnd.atFrame) {
      return getInterpolatedSpeed(speedKeyframes[index], segmentEnd, frame);
    }
  }

  return last.speed;
}

// Closed-form integral of the piecewise-linear speed curve from frame 0.
// Naively interpolating a playback rate makes the video jump, because each
// frame is evaluated independently — the elapsed source time must accumulate.
export function getSourceFrameOffset(input: {
  frame: number;
  speedKeyframes: ReadonlyArray<SpeedKeyframe>;
}): number {
  const { speedKeyframes } = input;
  const endFrame = Math.max(0, input.frame);
  if (speedKeyframes.length === 0) {
    return endFrame;
  }

  const first = speedKeyframes[0];
  const last = speedKeyframes[speedKeyframes.length - 1];
  let sourceFrames = 0;

  if (first.atFrame > 0) {
    sourceFrames += Math.min(endFrame, first.atFrame) * first.speed;
  }

  for (let index = 0; index < speedKeyframes.length - 1; index++) {
    const segmentStart = speedKeyframes[index];
    const segmentEnd = speedKeyframes[index + 1];
    const from = Math.max(segmentStart.atFrame, 0);
    const to = Math.min(segmentEnd.atFrame, endFrame);
    if (to <= from) {
      continue;
    }
    const speedAtFrom = getInterpolatedSpeed(segmentStart, segmentEnd, from);
    const speedAtTo = getInterpolatedSpeed(segmentStart, segmentEnd, to);
    sourceFrames += ((speedAtFrom + speedAtTo) / 2) * (to - from);
  }

  if (endFrame > last.atFrame) {
    sourceFrames += (endFrame - Math.max(last.atFrame, 0)) * last.speed;
  }

  return sourceFrames;
}

function getSmearStrength(speed: number): number {
  return clampUnit(
    (speed - ECHO_MIN_SPEED) / (ECHO_FULL_STRENGTH_SPEED - ECHO_MIN_SPEED)
  );
}

// Afterimages approximate a long exposure, which averages light over time —
// hence decaying alpha over the live frame rather than a screen blend, which
// would blow out daylight footage.
export function getEchoLayers(input: {
  speed: number;
  echoCount: number;
}): EchoLayer[] {
  const strength = getSmearStrength(input.speed);
  if (strength <= 0 || input.echoCount <= 0) {
    return [];
  }

  const spacingInFrames = (input.speed - ECHO_MIN_SPEED) * ECHO_SPACING_FACTOR;

  return Array.from({ length: input.echoCount }, (_, echoIndex) => ({
    echoIndex,
    sourceOffsetInFrames: spacingInFrames * (echoIndex + 1),
    opacity: strength * ECHO_LEAD_OPACITY * ECHO_OPACITY_DECAY ** echoIndex,
  }));
}

export function getSmearBlurInPx(speed: number): number {
  return getSmearStrength(speed) * MAX_SMEAR_BLUR_IN_PX;
}

export function getPlaybackRate(speed: number): number {
  return Math.min(MAX_PLAYBACK_RATE, Math.max(MIN_PLAYBACK_RATE, speed));
}
