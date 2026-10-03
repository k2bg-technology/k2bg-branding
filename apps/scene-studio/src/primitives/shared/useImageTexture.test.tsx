// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import type { ColorSpace } from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useImageTexture } from './useImageTexture';

const mocks = vi.hoisted(() => ({
  delayRender: vi.fn(() => 42),
  continueRender: vi.fn(),
  cancelRender: vi.fn(),
  advance: vi.fn(),
  environment: { isRendering: true },
  textureLoad: {} as {
    onLoad?: (texture: { colorSpace?: string }) => void;
    onError?: (error: unknown) => void;
  },
}));

vi.mock('remotion', () => ({
  delayRender: mocks.delayRender,
  continueRender: mocks.continueRender,
  cancelRender: mocks.cancelRender,
  useRemotionEnvironment: () => ({
    isRendering: mocks.environment.isRendering,
  }),
}));

vi.mock('@react-three/fiber', () => ({
  useThree: (selector: (state: { advance: () => void }) => unknown) =>
    selector({ advance: mocks.advance }),
}));

vi.mock('three', () => ({
  SRGBColorSpace: 'srgb',
  NoColorSpace: '',
  TextureLoader: class {
    load(
      _src: string,
      onLoad: (texture: { colorSpace?: string }) => void,
      _onProgress: undefined,
      onError: (error: unknown) => void
    ) {
      mocks.textureLoad.onLoad = onLoad;
      mocks.textureLoad.onError = onError;
    }
  },
}));

function TextureProbe({ colorSpace }: { colorSpace?: ColorSpace }) {
  useImageTexture(
    'data:image/svg+xml,card',
    colorSpace === undefined ? undefined : { colorSpace }
  );

  return null;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.environment.isRendering = true;
  mocks.textureLoad.onLoad = undefined;
  mocks.textureLoad.onError = undefined;
});

afterEach(() => {
  cleanup();
});

describe('useImageTexture', () => {
  it('delays the render until the texture has loaded', () => {
    render(<TextureProbe />);

    expect(mocks.delayRender).toHaveBeenCalledTimes(1);
    expect(mocks.continueRender).not.toHaveBeenCalled();
  });

  it('releases the delayed render once the texture has loaded', () => {
    render(<TextureProbe />);

    act(() => {
      mocks.textureLoad.onLoad?.({});
    });

    const delayRenderHandle = 42;
    expect(mocks.continueRender).toHaveBeenCalledWith(delayRenderHandle);
  });

  it('redraws the frozen canvas before releasing the render while rendering', () => {
    render(<TextureProbe />);

    act(() => {
      mocks.textureLoad.onLoad?.({});
    });

    const advanceCallOrder = mocks.advance.mock.invocationCallOrder[0];
    const continueRenderCallOrder =
      mocks.continueRender.mock.invocationCallOrder[0];
    expect(advanceCallOrder).toBeLessThan(continueRenderCallOrder);
  });

  it('does not redraw the canvas in the preview environment', () => {
    mocks.environment.isRendering = false;
    render(<TextureProbe />);

    act(() => {
      mocks.textureLoad.onLoad?.({});
    });

    expect(mocks.advance).not.toHaveBeenCalled();
    expect(mocks.continueRender).toHaveBeenCalledTimes(1);
  });

  it('marks the loaded texture as sRGB by default', () => {
    render(<TextureProbe />);
    const loadedTexture: { colorSpace?: string } = {};

    act(() => {
      mocks.textureLoad.onLoad?.(loadedTexture);
    });

    expect(loadedTexture.colorSpace).toBe('srgb');
  });

  it('applies a color space override to the loaded texture', () => {
    render(<TextureProbe colorSpace="" />);
    const loadedTexture: { colorSpace?: string } = {};

    act(() => {
      mocks.textureLoad.onLoad?.(loadedTexture);
    });

    expect(loadedTexture.colorSpace).toBe('');
  });

  it('cancels the render when the texture fails to load', () => {
    render(<TextureProbe />);
    const loadError = new Error('texture decode failed');

    act(() => {
      mocks.textureLoad.onError?.(loadError);
    });

    expect(mocks.cancelRender).toHaveBeenCalledWith(loadError);
    expect(mocks.continueRender).not.toHaveBeenCalled();
  });
});
