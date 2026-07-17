// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ImagePlane } from './ImagePlane';

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

function renderImagePlane() {
  return render(
    <ImagePlane
      src="data:image/svg+xml,card"
      position={[0, 0, -2.5]}
      opacity={1}
    />
  );
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

describe('ImagePlane', () => {
  it('delays the render until the texture has loaded', () => {
    renderImagePlane();

    expect(mocks.delayRender).toHaveBeenCalledTimes(1);
    expect(mocks.continueRender).not.toHaveBeenCalled();
  });

  it('releases the delayed render once the texture has loaded', () => {
    renderImagePlane();

    act(() => {
      mocks.textureLoad.onLoad?.({});
    });

    const delayRenderHandle = 42;
    expect(mocks.continueRender).toHaveBeenCalledWith(delayRenderHandle);
  });

  it('redraws the frozen canvas before releasing the render while rendering', () => {
    renderImagePlane();

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
    renderImagePlane();

    act(() => {
      mocks.textureLoad.onLoad?.({});
    });

    expect(mocks.advance).not.toHaveBeenCalled();
    expect(mocks.continueRender).toHaveBeenCalledTimes(1);
  });

  it('marks the loaded texture as sRGB for correct colors', () => {
    renderImagePlane();
    const loadedTexture: { colorSpace?: string } = {};

    act(() => {
      mocks.textureLoad.onLoad?.(loadedTexture);
    });

    expect(loadedTexture.colorSpace).toBe('srgb');
  });

  it('cancels the render when the texture fails to load', () => {
    renderImagePlane();
    const loadError = new Error('texture decode failed');

    act(() => {
      mocks.textureLoad.onError?.(loadError);
    });

    expect(mocks.cancelRender).toHaveBeenCalledWith(loadError);
    expect(mocks.continueRender).not.toHaveBeenCalled();
  });
});
