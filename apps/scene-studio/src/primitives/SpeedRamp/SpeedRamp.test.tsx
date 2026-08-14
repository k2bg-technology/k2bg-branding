// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { CSSProperties, PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SpeedRamp } from './SpeedRamp';
import {
  getEchoLayers,
  MAX_SMEAR_BLUR_IN_PX,
  type SpeedKeyframe,
} from './speedRampMotion';

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

// Speed 1 for 60 frames, then a linear ramp reaching 3 at frame 60: the
// integral at frame 60 is exactly 120 source frames.
const RAMP_KEYFRAMES: ReadonlyArray<SpeedKeyframe> = [
  { atFrame: 0, speed: 1 },
  { atFrame: 60, speed: 3 },
];
const RAMP_SOURCE_FRAMES_AT_60 = 120;

beforeEach(() => {
  mocks.frame = 0;
});

afterEach(() => {
  cleanup();
});

describe('SpeedRamp', () => {
  it('trims the live layer to the accumulated source frame', () => {
    mocks.frame = 60;
    const sourceStartInFrames = 10;

    render(
      <SpeedRamp
        src="clip.mp4"
        speedKeyframes={RAMP_KEYFRAMES}
        sourceStartInFrames={sourceStartInFrames}
        echoCount={0}
      />
    );

    const layer = screen.getByTestId('layer');
    const expectedTrim = sourceStartInFrames + RAMP_SOURCE_FRAMES_AT_60;
    expect(layer.getAttribute('data-trim-before')).toBe(String(expectedTrim));
    expect(layer.getAttribute('data-playback-rate')).toBe('3');
    expect(layer.getAttribute('data-muted')).toBe('true');
  });

  it('repositions every layer sequence to the current frame', () => {
    mocks.frame = 60;

    render(
      <SpeedRamp src="clip.mp4" speedKeyframes={RAMP_KEYFRAMES} echoCount={2} />
    );

    const sequences = screen.getAllByTestId('sequence');
    expect(sequences).toHaveLength(3);
    for (const sequence of sequences) {
      expect(sequence.getAttribute('data-from')).toBe('60');
    }
  });

  it('renders only the live layer without smear at normal speed', () => {
    mocks.frame = 0;

    const { container } = render(
      <SpeedRamp src="clip.mp4" speedKeyframes={RAMP_KEYFRAMES} echoCount={3} />
    );

    expect(screen.getAllByTestId('layer')).toHaveLength(1);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.filter).toBe('');
  });

  it('layers ghosts at trailing source frames with fading opacity', () => {
    mocks.frame = 60;
    const sourceStartInFrames = 10;

    const { container } = render(
      <SpeedRamp
        src="clip.mp4"
        speedKeyframes={RAMP_KEYFRAMES}
        sourceStartInFrames={sourceStartInFrames}
        echoCount={2}
      />
    );

    const layers = screen.getAllByTestId('layer');
    expect(layers).toHaveLength(3);

    const liveTrim = sourceStartInFrames + RAMP_SOURCE_FRAMES_AT_60;
    const echoLayers = getEchoLayers({ speed: 3, echoCount: 2 });
    layers.slice(1).forEach((ghost, echoIndex) => {
      const echoLayer = echoLayers[echoIndex];
      const expectedTrim = Math.round(
        liveTrim - echoLayer.sourceOffsetInFrames
      );
      expect(ghost.getAttribute('data-trim-before')).toBe(String(expectedTrim));

      const opacityWrapper = ghost.parentElement?.parentElement as HTMLElement;
      expect(Number(opacityWrapper.style.opacity)).toBeCloseTo(
        echoLayer.opacity
      );
    });

    const root = container.firstElementChild as HTMLElement;
    expect(root.style.filter).toBe(`blur(${MAX_SMEAR_BLUR_IN_PX}px)`);
  });

  it('clamps ghost trims at the clip start', () => {
    mocks.frame = 0;
    const immediateRush = [{ atFrame: 0, speed: 10 }];

    render(
      <SpeedRamp src="clip.mp4" speedKeyframes={immediateRush} echoCount={3} />
    );

    const layers = screen.getAllByTestId('layer');
    for (const ghost of layers.slice(1)) {
      expect(ghost.getAttribute('data-trim-before')).toBe('0');
    }
  });
});
