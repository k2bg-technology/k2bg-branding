// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Texture } from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Kaleidoscope } from './Kaleidoscope';

const mocks = vi.hoisted(() => ({
  capturedUniforms: null as Record<string, unknown> | null,
  frame: 0,
}));

vi.mock('remotion', () => ({
  useCurrentFrame: () => mocks.frame,
  useVideoConfig: () => ({ width: 1080, height: 1920, fps: 30 }),
}));

vi.mock('../shared/MediaTextureStage', () => ({
  MediaTextureStage: ({
    children,
  }: {
    children: (texture: Texture) => ReactNode;
  }) => children({ image: { width: 600, height: 900 } } as unknown as Texture),
}));

vi.mock('../shared/ScreenQuad', () => ({
  ScreenQuad: ({
    uniformValues,
  }: {
    uniformValues: Record<string, unknown>;
  }) => {
    mocks.capturedUniforms = uniformValues;
    return null;
  },
}));

beforeEach(() => {
  mocks.capturedUniforms = null;
  mocks.frame = 0;
});

afterEach(() => {
  cleanup();
});

describe('Kaleidoscope', () => {
  it('passes the segment count through', () => {
    render(<Kaleidoscope src="card.svg" amount={1} segments={8} />);

    expect(mocks.capturedUniforms?.uSegments).toBe(8);
  });

  it('derives the rotation from the static angle', () => {
    render(<Kaleidoscope src="card.svg" amount={1} rotationInDegrees={90} />);

    expect(mocks.capturedUniforms?.uRotation).toBeCloseTo(Math.PI / 2);
  });

  it('advances the rotation with time at the configured speed', () => {
    mocks.frame = 30;

    render(
      <Kaleidoscope src="card.svg" amount={1} speedInDegreesPerSecond={90} />
    );

    expect(mocks.capturedUniforms?.uRotation).toBeCloseTo(Math.PI / 2);
  });

  it('clamps amount into the unit range', () => {
    render(<Kaleidoscope src="card.svg" amount={2} />);

    expect(mocks.capturedUniforms?.uAmount).toBe(1);
  });
});
