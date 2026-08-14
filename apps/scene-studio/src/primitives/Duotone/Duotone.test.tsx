// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Texture, Vector3 } from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Duotone } from './Duotone';

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

describe('Duotone', () => {
  it('maps the hex colors into unit-range uniforms', () => {
    render(
      <Duotone
        src="card.svg"
        amount={1}
        shadowColor="#000000"
        highlightColor="#ff8000"
      />
    );

    const shadow = mocks.capturedUniforms?.uShadowColor as Vector3;
    const highlight = mocks.capturedUniforms?.uHighlightColor as Vector3;
    expect(shadow.x).toBe(0);
    expect(shadow.y).toBe(0);
    expect(shadow.z).toBe(0);
    expect(highlight.x).toBeCloseTo(1);
    expect(highlight.y).toBeCloseTo(128 / 255);
    expect(highlight.z).toBeCloseTo(0);
  });

  it('clamps amount into the unit range', () => {
    render(<Duotone src="card.svg" amount={-0.5} />);

    expect(mocks.capturedUniforms?.uAmount).toBe(0);
  });

  it('throws on a malformed color', () => {
    expect(() =>
      render(<Duotone src="card.svg" amount={1} shadowColor="#12zzzz" />)
    ).toThrow('Invalid hex color');
  });
});
