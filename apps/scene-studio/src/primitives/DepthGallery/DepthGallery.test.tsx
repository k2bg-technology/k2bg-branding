// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DepthGallery } from './DepthGallery';
import {
  getDollyDistance,
  getPlaneOpacity,
  getPlanePlacement,
} from './depthMotion';

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

    const expectedDolly = getDollyDistance({
      frame: 60,
      durationInFrames: COMPOSITION_DURATION_IN_FRAMES,
      planeCount: SOURCES.length,
    });
    const firstPlane = getPlanePlacement({ planeIndex: 0 });
    expect(mocks.capturedPlanes[0].opacity).toBeCloseTo(
      getPlaneOpacity({ planeZ: firstPlane.z, dollyDistance: expectedDolly })
    );
  });

  it('spans the dolly over an explicit duration override', () => {
    mocks.frame = 60;
    const overrideDurationInFrames = 120;

    render(
      <DepthGallery
        sources={SOURCES}
        durationInFrames={overrideDurationInFrames}
      />
    );

    const overrideDolly = getDollyDistance({
      frame: 60,
      durationInFrames: overrideDurationInFrames,
      planeCount: SOURCES.length,
    });
    const fallbackDolly = getDollyDistance({
      frame: 60,
      durationInFrames: COMPOSITION_DURATION_IN_FRAMES,
      planeCount: SOURCES.length,
    });
    const firstPlane = getPlanePlacement({ planeIndex: 0 });
    const overrideOpacity = getPlaneOpacity({
      planeZ: firstPlane.z,
      dollyDistance: overrideDolly,
    });
    const fallbackOpacity = getPlaneOpacity({
      planeZ: firstPlane.z,
      dollyDistance: fallbackDolly,
    });
    expect(overrideOpacity).not.toBeCloseTo(fallbackOpacity);
    expect(mocks.capturedPlanes[0].opacity).toBeCloseTo(overrideOpacity);
  });
});
