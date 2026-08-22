// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { Texture } from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MediaTextureStage } from './MediaTextureStage';

const mocks = vi.hoisted(() => ({
  delayRender: vi.fn(() => 7),
  continueRender: vi.fn(),
  advance: vi.fn(),
  environment: { isRendering: false },
  imageTexture: null as Texture | null,
  previewTexture: null as Texture | null,
  offthreadTexture: null as Texture | null,
  useOffthreadVideoTexture: vi.fn(() => mocks.offthreadTexture),
}));

vi.mock('remotion', () => ({
  Video: ({ src }: { src: string }) => (
    <div data-testid="preview-video" data-src={src} />
  ),
  delayRender: mocks.delayRender,
  continueRender: mocks.continueRender,
  useCurrentFrame: () => 0,
  useRemotionEnvironment: () => ({
    isRendering: mocks.environment.isRendering,
  }),
  useVideoConfig: () => ({ width: 1080, height: 1920, fps: 30 }),
}));

vi.mock('@remotion/three', () => ({
  ThreeCanvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="three-canvas">{children}</div>
  ),
  useVideoTexture: () => mocks.previewTexture,
  useOffthreadVideoTexture: mocks.useOffthreadVideoTexture,
}));

vi.mock('@react-three/fiber', () => ({
  useThree: (selector: (state: { advance: () => void }) => unknown) =>
    selector({ advance: mocks.advance }),
}));

vi.mock('./useImageTexture', () => ({
  useImageTexture: () => mocks.imageTexture,
}));

const fakeTexture = (name: string) => ({ name }) as unknown as Texture;

function renderStage(input: {
  mediaType: 'image' | 'video';
}): ReturnType<typeof render> {
  return render(
    <MediaTextureStage src="media.mp4" mediaType={input.mediaType}>
      {(texture) => <span data-testid="scene">{texture.name}</span>}
    </MediaTextureStage>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.environment.isRendering = false;
  mocks.imageTexture = null;
  mocks.previewTexture = null;
  mocks.offthreadTexture = null;
});

afterEach(() => {
  cleanup();
});

describe('MediaTextureStage', () => {
  it('hands the loaded image texture to the scene without a video element', () => {
    mocks.imageTexture = fakeTexture('image');

    renderStage({ mediaType: 'image' });

    expect(screen.getByTestId('scene').textContent).toBe('image');
    expect(screen.queryByTestId('preview-video')).toBeNull();
  });

  it('renders nothing inside the canvas while the texture loads', () => {
    renderStage({ mediaType: 'image' });

    expect(screen.queryByTestId('scene')).toBeNull();
  });

  it('backs a preview video with a hidden video element', () => {
    mocks.previewTexture = fakeTexture('preview');

    renderStage({ mediaType: 'video' });

    expect(screen.getByTestId('preview-video')).toBeTruthy();
    expect(screen.getByTestId('scene').textContent).toBe('preview');
    expect(mocks.useOffthreadVideoTexture).not.toHaveBeenCalled();
  });

  it('uses the offthread texture without a video element while rendering', () => {
    mocks.environment.isRendering = true;
    mocks.offthreadTexture = fakeTexture('offthread');

    renderStage({ mediaType: 'video' });

    expect(screen.queryByTestId('preview-video')).toBeNull();
    expect(screen.getByTestId('scene').textContent).toBe('offthread');
  });

  it('holds the render until the offthread frame texture arrives', () => {
    mocks.environment.isRendering = true;

    renderStage({ mediaType: 'video' });

    expect(mocks.delayRender).toHaveBeenCalledTimes(1);
    expect(mocks.continueRender).not.toHaveBeenCalled();
  });

  it('redraws the frozen canvas before releasing the offthread frame', () => {
    mocks.environment.isRendering = true;
    const { rerender } = render(
      <MediaTextureStage src="media.mp4" mediaType="video">
        {(texture) => <span data-testid="scene">{texture.name}</span>}
      </MediaTextureStage>
    );

    mocks.offthreadTexture = fakeTexture('offthread');
    rerender(
      <MediaTextureStage src="media.mp4" mediaType="video">
        {(texture) => <span data-testid="scene">{texture.name}</span>}
      </MediaTextureStage>
    );

    const advanceCallOrder = mocks.advance.mock.invocationCallOrder[0];
    const continueRenderCallOrder =
      mocks.continueRender.mock.invocationCallOrder[0];
    expect(advanceCallOrder).toBeLessThan(continueRenderCallOrder);
    expect(mocks.continueRender).toHaveBeenCalledWith(7);
  });
});
