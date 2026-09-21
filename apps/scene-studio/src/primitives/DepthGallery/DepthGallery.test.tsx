// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DepthGallery } from './DepthGallery';

const mocks = vi.hoisted(() => ({
  frame: 0,
  capturedPlanes: [] as Array<{ src: string; opacity: number }>,
}));

const COMPOSITION_DURATION_IN_FRAMES = 300;

vi.mock('remotion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('remotion')>();
  return {
    ...actual,
    useCurrentFrame: () => mocks.frame,
    useVideoConfig: () => ({
      width: 1080,
      height: 1920,
      fps: 30,
      durationInFrames: COMPOSITION_DURATION_IN_FRAMES,
    }),
  };
});

vi.mock('@remotion/three', () => ({
  ThreeCanvas: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('./ImagePlane', () => ({
  ImagePlane: (props: { src: string; opacity: number }) => {
    mocks.capturedPlanes.push(props);
    return null;
  },
}));

const SOURCES = ['first.jpg', 'second.jpg', 'third.jpg'];

beforeEach(() => {
  mocks.frame = 0;
  mocks.capturedPlanes = [];
});

afterEach(() => {
  cleanup();
});

describe('DepthGallery', () => {
  it('spans the dolly over the composition duration by default', () => {
    mocks.frame = 60;

    render(<DepthGallery sources={SOURCES} />);

    expect(mocks.capturedPlanes[0]).toMatchObject({
      src: 'first.jpg',
      opacity: 1,
    });
  });

  it('spans the dolly over an explicit duration override', () => {
    mocks.frame = 60;
    const overrideDurationInFrames = 61;

    render(
      <DepthGallery
        sources={SOURCES}
        durationInFrames={overrideDurationInFrames}
      />
    );

    expect(mocks.capturedPlanes[0]).toMatchObject({
      src: 'first.jpg',
      opacity: 0,
    });
  });
});
