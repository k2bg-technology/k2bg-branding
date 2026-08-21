// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Texture, Vector2 } from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RadialBlur } from './RadialBlur';

// Mirrors MAX_ZOOM_PULL: the strength the shader receives at amount 1.
const FULL_AMOUNT_STRENGTH = 0.25;

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

describe('RadialBlur', () => {
  it('leaves the strength at zero so amount 0 passes the media through', () => {
    render(<RadialBlur src="card.svg" amount={0} />);

    expect(mocks.capturedUniforms?.uStrength).toBe(0);
  });

  it.each([
    { amount: 0.5, expectedStrength: FULL_AMOUNT_STRENGTH / 2 },
    { amount: 1, expectedStrength: FULL_AMOUNT_STRENGTH },
  ])(
    'derives the strength $expectedStrength from amount $amount',
    ({ amount, expectedStrength }) => {
      render(<RadialBlur src="card.svg" amount={amount} />);

      expect(mocks.capturedUniforms?.uStrength).toBeCloseTo(expectedStrength);
    }
  );

  it('clamps the strength at the full zoom pull', () => {
    render(<RadialBlur src="card.svg" amount={2} />);

    expect(mocks.capturedUniforms?.uStrength).toBeCloseTo(FULL_AMOUNT_STRENGTH);
  });

  it('passes the center through', () => {
    render(
      <RadialBlur src="card.svg" amount={1} center={{ x: 0.2, y: 0.8 }} />
    );

    const center = mocks.capturedUniforms?.uCenter as Vector2;
    expect(center.x).toBe(0.2);
    expect(center.y).toBe(0.8);
  });

  it('centers the zoom on the canvas by default', () => {
    render(<RadialBlur src="card.svg" amount={1} />);

    const center = mocks.capturedUniforms?.uCenter as Vector2;
    expect(center.x).toBe(0.5);
    expect(center.y).toBe(0.5);
  });

  it('cover-fits the media into the canvas', () => {
    render(<RadialBlur src="card.svg" amount={1} />);

    const coverScale = mocks.capturedUniforms?.uCoverScale as Vector2;
    const canvasAspect = 1080 / 1920;
    const imageAspect = 600 / 900;
    expect(coverScale.x).toBeCloseTo(canvasAspect / imageAspect);
    expect(coverScale.y).toBe(1);
  });
});
