// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Texture, Vector2 } from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TwirlDistortion } from './TwirlDistortion';

const DEGREES_TO_RADIANS = Math.PI / 180;
// Mirrors MAX_RGB_SPREAD: the channel spread the shader receives at rgbShift 1.
const FULL_RGB_SPREAD = 0.08;
const DEFAULT_MAX_ROTATION_IN_DEGREES = 240;

const mocks = vi.hoisted(() => ({
  capturedUniforms: null as Record<string, unknown> | null,
}));

vi.mock('remotion', () => ({
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
});

afterEach(() => {
  cleanup();
});

describe('TwirlDistortion', () => {
  it('leaves the rotation at zero so amount 0 passes the media through', () => {
    render(<TwirlDistortion src="card.svg" amount={0} />);

    expect(mocks.capturedUniforms?.uRotationInRadians).toBe(0);
  });

  it.each([
    { amount: 0.5, maxRotationInDegrees: 180 },
    { amount: 1, maxRotationInDegrees: 90 },
  ])('scales $maxRotationInDegrees degrees by amount $amount', ({
    amount,
    maxRotationInDegrees,
  }) => {
    render(
      <TwirlDistortion
        src="card.svg"
        amount={amount}
        maxRotationInDegrees={maxRotationInDegrees}
      />
    );

    expect(mocks.capturedUniforms?.uRotationInRadians).toBeCloseTo(
      amount * maxRotationInDegrees * DEGREES_TO_RADIANS
    );
  });

  it('clamps amount into the unit range', () => {
    render(<TwirlDistortion src="card.svg" amount={2} />);

    expect(mocks.capturedUniforms?.uRotationInRadians).toBeCloseTo(
      DEFAULT_MAX_ROTATION_IN_DEGREES * DEGREES_TO_RADIANS
    );
  });

  it('spreads no channels when rgbShift is 0', () => {
    render(<TwirlDistortion src="card.svg" amount={1} />);

    expect(mocks.capturedUniforms?.uRgbSpread).toBe(0);
  });

  it('derives the channel spread from rgbShift', () => {
    render(<TwirlDistortion src="card.svg" amount={1} rgbShift={0.5} />);

    expect(mocks.capturedUniforms?.uRgbSpread).toBeCloseTo(FULL_RGB_SPREAD / 2);
  });

  it('clamps rgbShift into the unit range', () => {
    render(<TwirlDistortion src="card.svg" amount={1} rgbShift={3} />);

    expect(mocks.capturedUniforms?.uRgbSpread).toBeCloseTo(FULL_RGB_SPREAD);
  });

  it('passes the falloff radius through', () => {
    render(<TwirlDistortion src="card.svg" amount={1} radius={0.3} />);

    expect(mocks.capturedUniforms?.uRadius).toBe(0.3);
  });

  it('passes the center through', () => {
    render(
      <TwirlDistortion
        src="card.svg"
        amount={1}
        center={{ x: 0.25, y: 0.75 }}
      />
    );

    const center = mocks.capturedUniforms?.uCenter as Vector2;
    expect(center.x).toBe(0.25);
    expect(center.y).toBe(0.75);
  });

  it('swirls around the canvas center by default', () => {
    render(<TwirlDistortion src="card.svg" amount={1} />);

    const center = mocks.capturedUniforms?.uCenter as Vector2;
    expect(center.x).toBe(0.5);
    expect(center.y).toBe(0.5);
  });

  it('cover-fits the media into the canvas', () => {
    render(<TwirlDistortion src="card.svg" amount={1} />);

    const coverScale = mocks.capturedUniforms?.uCoverScale as Vector2;
    const canvasAspect = 1080 / 1920;
    const imageAspect = 600 / 900;
    expect(coverScale.x).toBeCloseTo(canvasAspect / imageAspect);
    expect(coverScale.y).toBe(1);
  });
});
