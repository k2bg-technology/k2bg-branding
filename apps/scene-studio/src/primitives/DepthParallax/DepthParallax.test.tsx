// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Vector2 } from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DepthParallax } from './DepthParallax';

const mocks = vi.hoisted(() => ({
  capturedUniforms: null as Record<string, unknown> | null,
  frame: 0,
  loadedTexture: { image: { width: 600, height: 900 } },
}));

vi.mock('remotion', () => ({
  useCurrentFrame: () => mocks.frame,
  useVideoConfig: () => ({ width: 1080, height: 1920, fps: 30 }),
}));

vi.mock('@remotion/three', () => ({
  ThreeCanvas: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../shared/useImageTexture', () => ({
  useImageTexture: () => mocks.loadedTexture,
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

describe('DepthParallax', () => {
  it('starts the push-in from the untouched frame', () => {
    render(
      <DepthParallax
        src="photo.jpg"
        depthSrc="depth.png"
        parallaxAmount={1}
        dollyAmount={1}
      />
    );

    const offset = mocks.capturedUniforms?.uParallaxOffset as Vector2;
    expect(offset.x).toBeCloseTo(0);
    expect(mocks.capturedUniforms?.uZoom).toBe(1);
  });

  it('sways within the parallax amplitude as time advances', () => {
    mocks.frame = 30;

    render(
      <DepthParallax src="photo.jpg" depthSrc="depth.png" parallaxAmount={1} />
    );

    const offset = mocks.capturedUniforms?.uParallaxOffset as Vector2;
    const maxParallaxInUv = 0.04;
    expect(Math.abs(offset.x)).toBeGreaterThan(0);
    expect(Math.abs(offset.x)).toBeLessThanOrEqual(maxParallaxInUv);
  });

  it('clamps focus into the unit range', () => {
    render(
      <DepthParallax
        src="photo.jpg"
        depthSrc="depth.png"
        parallaxAmount={0}
        focus={1.5}
      />
    );

    expect(mocks.capturedUniforms?.uFocus).toBe(1);
  });

  it('scales the blur radius from the blur amount', () => {
    render(
      <DepthParallax
        src="photo.jpg"
        depthSrc="depth.png"
        parallaxAmount={0}
        blurAmount={0.5}
      />
    );

    const maxBlurInUv = 0.012;
    expect(mocks.capturedUniforms?.uMaxBlurInUv).toBeCloseTo(maxBlurInUv * 0.5);
  });

  it('rests as the untouched photo with zero amounts', () => {
    render(
      <DepthParallax src="photo.jpg" depthSrc="depth.png" parallaxAmount={0} />
    );

    const offset = mocks.capturedUniforms?.uParallaxOffset as Vector2;
    expect(offset.x).toBe(0);
    expect(offset.y).toBe(0);
    expect(mocks.capturedUniforms?.uZoom).toBe(1);
    expect(mocks.capturedUniforms?.uMaxBlurInUv).toBe(0);
  });
});
