// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { CSSProperties, PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SpeedRamp } from './SpeedRamp';
import type { SpeedKeyframe } from './speedRampMotion';

const mocks = vi.hoisted(() => ({ frame: 0 }));

vi.mock('remotion', () => ({
  useCurrentFrame: () => mocks.frame,
  AbsoluteFill: ({
    children,
    className,
    style,
  }: PropsWithChildren<{ className?: string; style?: CSSProperties }>) => (
    <div className={className} style={style}>
      {children}
    </div>
  ),
  Sequence: ({
    children,
    from,
  }: PropsWithChildren<{ from?: number; layout?: string }>) => (
    <div data-testid="sequence" data-from={from}>
      {children}
    </div>
  ),
  OffthreadVideo: ({
    src,
    trimBefore,
    playbackRate,
    muted,
  }: {
    src: string;
    trimBefore?: number;
    playbackRate?: number;
    muted?: boolean;
  }) => (
    <video
      muted
      data-testid="layer"
      data-src={src}
      data-trim-before={trimBefore}
      data-playback-rate={playbackRate}
      data-muted={String(muted)}
    />
  ),
}));

// A linear speed ramp from 1 to 3 over 60 frames means the
// integral at frame 60 is exactly 120 source frames.
const RAMP_KEYFRAMES: ReadonlyArray<SpeedKeyframe> = [
  { atFrame: 0, speed: 1 },
  { atFrame: 60, speed: 3 },
];
const RAMP_SOURCE_FRAMES_AT_60 = 120;
const SOURCE_START_IN_FRAMES = 10;
const LIVE_TRIM_AT_60 = SOURCE_START_IN_FRAMES + RAMP_SOURCE_FRAMES_AT_60;

beforeEach(() => {
  mocks.frame = 0;
});

afterEach(() => {
  cleanup();
});

describe('SpeedRamp', () => {
  it('trims the live layer to the accumulated source frame', () => {
    mocks.frame = 60;

    render(
      <SpeedRamp
        src="clip.mp4"
        speedKeyframes={RAMP_KEYFRAMES}
        sourceStartInFrames={SOURCE_START_IN_FRAMES}
        echoCount={0}
      />
    );

    const layer = screen.getByTestId('layer');
    expect(layer.getAttribute('data-trim-before')).toBe(
      String(LIVE_TRIM_AT_60)
    );
    expect(layer.getAttribute('data-playback-rate')).toBe('3');
    expect(layer.getAttribute('data-muted')).toBe('true');
  });

  it('repositions every layer sequence to the current frame', () => {
    mocks.frame = 60;

    render(
      <SpeedRamp src="clip.mp4" speedKeyframes={RAMP_KEYFRAMES} echoCount={2} />
    );

    const sequenceStarts = screen
      .getAllByTestId('sequence')
      .map((sequence) => sequence.getAttribute('data-from'));
    expect(sequenceStarts).toEqual(['60', '60', '60']);
  });

  it('renders only the live layer at normal speed', () => {
    mocks.frame = 0;

    render(
      <SpeedRamp src="clip.mp4" speedKeyframes={RAMP_KEYFRAMES} echoCount={3} />
    );

    expect(screen.getAllByTestId('layer')).toHaveLength(1);
  });

  it.each([
    { ghostIndex: 0, expectedTrim: 129 },
    { ghostIndex: 1, expectedTrim: 128 },
  ])(
    'trims ghost $ghostIndex to its trailing source frame',
    ({ ghostIndex, expectedTrim }) => {
      mocks.frame = 60;

      render(
        <SpeedRamp
          src="clip.mp4"
          speedKeyframes={RAMP_KEYFRAMES}
          sourceStartInFrames={SOURCE_START_IN_FRAMES}
          echoCount={2}
        />
      );

      const ghost = screen.getAllByTestId('layer')[ghostIndex + 1];
      expect(ghost.getAttribute('data-trim-before')).toBe(String(expectedTrim));
    }
  );

  it('clamps ghost trims at the clip start', () => {
    mocks.frame = 0;
    const immediateRush = [{ atFrame: 0, speed: 10 }];

    render(
      <SpeedRamp src="clip.mp4" speedKeyframes={immediateRush} echoCount={3} />
    );

    const ghostTrims = screen
      .getAllByTestId('layer')
      .slice(1)
      .map((ghost) => ghost.getAttribute('data-trim-before'));
    expect(ghostTrims).toEqual(['0', '0', '0']);
  });
});
