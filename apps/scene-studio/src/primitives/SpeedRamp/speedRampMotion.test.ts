import { describe, expect, it } from 'vitest';

import {
  ECHO_FULL_STRENGTH_SPEED,
  ECHO_SPACING_FACTOR,
  getEchoLayers,
  getPlaybackRate,
  getSmearBlurInPx,
  getSourceFrameOffset,
  getSpeedAtFrame,
  MAX_PLAYBACK_RATE,
  MAX_SMEAR_BLUR_IN_PX,
  MIN_PLAYBACK_RATE,
  type SpeedKeyframe,
} from './speedRampMotion';

const RAMP_KEYFRAMES: ReadonlyArray<SpeedKeyframe> = [
  { atFrame: 0, speed: 1 },
  { atFrame: 60, speed: 3 },
];

describe('getSpeedAtFrame', () => {
  it.each([
    { frame: -10, expected: 1 },
    { frame: 0, expected: 1 },
    { frame: 30, expected: 2 },
    { frame: 60, expected: 3 },
    { frame: 200, expected: 3 },
  ])(
    'returns $expected on a 1-to-3 ramp over 60 frames at frame $frame',
    ({ frame, expected }) => {
      const result = getSpeedAtFrame({ frame, speedKeyframes: RAMP_KEYFRAMES });

      expect(result).toBe(expected);
    }
  );

  it('returns normal speed when no keyframes are given', () => {
    const result = getSpeedAtFrame({ frame: 42, speedKeyframes: [] });

    expect(result).toBe(1);
  });
});

describe('getSourceFrameOffset', () => {
  it.each([
    { frame: 0, expected: 0 },
    { frame: 30, expected: 30 },
    { frame: 90, expected: 90 },
  ])(
    'advances one source frame per frame at constant speed 1 (frame $frame)',
    ({ frame, expected }) => {
      const constantSpeed = [{ atFrame: 0, speed: 1 }];

      const result = getSourceFrameOffset({
        frame,
        speedKeyframes: constantSpeed,
      });

      expect(result).toBe(expected);
    }
  );

  it('integrates a linear 1-to-3 ramp over 60 frames to exactly 120 source frames', () => {
    const result = getSourceFrameOffset({
      frame: 60,
      speedKeyframes: RAMP_KEYFRAMES,
    });

    expect(result).toBe(120);
  });

  it('holds the first speed before the first keyframe', () => {
    const delayedKeyframes = [{ atFrame: 10, speed: 2 }];

    const result = getSourceFrameOffset({
      frame: 5,
      speedKeyframes: delayedKeyframes,
    });

    expect(result).toBe(10);
  });

  it('holds the last speed after the last keyframe', () => {
    const result = getSourceFrameOffset({
      frame: 100,
      speedKeyframes: RAMP_KEYFRAMES,
    });

    const rampSourceFrames = 120;
    const heldFrames = 40;
    const lastSpeed = 3;
    expect(result).toBe(rampSourceFrames + heldFrames * lastSpeed);
  });

  it.each([
    { earlierFrame: 0, laterFrame: 30 },
    { earlierFrame: 30, laterFrame: 60 },
    { earlierFrame: 60, laterFrame: 120 },
  ])(
    'never rewinds the source between frame $earlierFrame and $laterFrame',
    ({ earlierFrame, laterFrame }) => {
      const earlierOffset = getSourceFrameOffset({
        frame: earlierFrame,
        speedKeyframes: RAMP_KEYFRAMES,
      });
      const laterOffset = getSourceFrameOffset({
        frame: laterFrame,
        speedKeyframes: RAMP_KEYFRAMES,
      });

      expect(laterOffset).toBeGreaterThanOrEqual(earlierOffset);
    }
  );
});

describe('getEchoLayers', () => {
  it.each([{ speed: 0.4 }, { speed: 1 }])(
    'renders no ghosts at or below normal speed ($speed)',
    ({ speed }) => {
      const result = getEchoLayers({ speed, echoCount: 3 });

      expect(result).toHaveLength(0);
    }
  );

  it('renders no ghosts when the echo count is zero', () => {
    const result = getEchoLayers({ speed: 10, echoCount: 0 });

    expect(result).toHaveLength(0);
  });

  it('spaces ghosts proportionally to the speed above normal', () => {
    const rushSpeed = 6;

    const result = getEchoLayers({ speed: rushSpeed, echoCount: 3 });

    const expectedSpacing = (rushSpeed - 1) * ECHO_SPACING_FACTOR;
    expect(result.map((layer) => layer.sourceOffsetInFrames)).toEqual([
      expectedSpacing,
      expectedSpacing * 2,
      expectedSpacing * 3,
    ]);
  });

  it('fades each ghost more than the previous one', () => {
    const result = getEchoLayers({ speed: 6, echoCount: 3 });

    expect(result[0].opacity).toBeGreaterThan(result[1].opacity);
    expect(result[1].opacity).toBeGreaterThan(result[2].opacity);
  });

  it('shows fainter ghosts while the speed is still ramping up', () => {
    const rampingLayers = getEchoLayers({ speed: 2, echoCount: 1 });
    const fullRushLayers = getEchoLayers({
      speed: ECHO_FULL_STRENGTH_SPEED,
      echoCount: 1,
    });

    expect(rampingLayers[0].opacity).toBeLessThan(fullRushLayers[0].opacity);
  });
});

describe('getSmearBlurInPx', () => {
  it.each([
    { speed: 0.4, expected: 0 },
    { speed: 1, expected: 0 },
    { speed: ECHO_FULL_STRENGTH_SPEED, expected: MAX_SMEAR_BLUR_IN_PX },
    { speed: 12, expected: MAX_SMEAR_BLUR_IN_PX },
  ])('returns $expected px at speed $speed', ({ speed, expected }) => {
    const result = getSmearBlurInPx(speed);

    expect(result).toBe(expected);
  });
});

describe('getPlaybackRate', () => {
  it.each([
    { speed: 0, expected: MIN_PLAYBACK_RATE },
    { speed: 2, expected: 2 },
    { speed: 100, expected: MAX_PLAYBACK_RATE },
  ])('clamps speed $speed to $expected', ({ speed, expected }) => {
    const result = getPlaybackRate(speed);

    expect(result).toBe(expected);
  });
});
