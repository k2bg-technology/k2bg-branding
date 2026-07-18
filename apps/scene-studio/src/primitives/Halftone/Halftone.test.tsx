// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Texture, Vector2 } from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Halftone } from './Halftone';

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

describe('Halftone', () => {
  it('clamps amount into the unit range', () => {
    render(<Halftone src="card.svg" amount={1.5} />);

    expect(mocks.capturedUniforms?.uAmount).toBe(1);
  });

  it('converts the screen angle to radians', () => {
    render(<Halftone src="card.svg" amount={1} angleInDegrees={45} />);

    expect(mocks.capturedUniforms?.uAngle).toBeCloseTo(Math.PI / 4);
  });

  it('passes the dot pitch through', () => {
    render(<Halftone src="card.svg" amount={1} spacingInPx={20} />);

    expect(mocks.capturedUniforms?.uSpacingInPx).toBe(20);
  });

  it('cover-fits the media into the canvas', () => {
    render(<Halftone src="card.svg" amount={1} />);

    const coverScale = mocks.capturedUniforms?.uCoverScale as Vector2;
    const canvasAspect = 1080 / 1920;
    const imageAspect = 600 / 900;
    expect(coverScale.x).toBeCloseTo(canvasAspect / imageAspect);
    expect(coverScale.y).toBe(1);
  });
});
