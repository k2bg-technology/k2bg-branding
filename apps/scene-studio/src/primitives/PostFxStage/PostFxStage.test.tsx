// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PostFxStage } from './PostFxStage';

const mocks = vi.hoisted(() => ({
  composerProps: null as Record<string, unknown> | null,
  bloomProps: null as Record<string, unknown> | null,
  depthOfFieldProps: null as Record<string, unknown> | null,
}));

vi.mock('remotion', () => ({
  useVideoConfig: () => ({ width: 1080, height: 1920, fps: 30 }),
}));

vi.mock('@remotion/three', () => ({
  ThreeCanvas: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children, ...props }: { children: ReactNode }) => {
    mocks.composerProps = props;
    return <div data-testid="composer">{children}</div>;
  },
  Bloom: (props: Record<string, unknown>) => {
    mocks.bloomProps = props;
    return null;
  },
  DepthOfField: (props: Record<string, unknown>) => {
    mocks.depthOfFieldProps = props;
    return null;
  },
}));

beforeEach(() => {
  mocks.composerProps = null;
  mocks.bloomProps = null;
  mocks.depthOfFieldProps = null;
});

afterEach(() => {
  cleanup();
});

describe('PostFxStage', () => {
  it('renders the bare scene without a composer when no effects are requested', () => {
    render(
      <PostFxStage>
        <span data-testid="scene" />
      </PostFxStage>
    );

    expect(screen.getByTestId('scene')).toBeTruthy();
    expect(screen.queryByTestId('composer')).toBeNull();
  });

  it('mounts the composer without multisampling when bloom is requested', () => {
    render(
      <PostFxStage bloom={{ intensity: 2, luminanceThreshold: 0.5 }}>
        <span data-testid="scene" />
      </PostFxStage>
    );

    expect(mocks.composerProps?.multisampling).toBe(0);
    expect(mocks.bloomProps?.intensity).toBe(2);
    expect(mocks.bloomProps?.luminanceThreshold).toBe(0.5);
    expect(mocks.depthOfFieldProps).toBeNull();
  });

  it('mounts the depth of field with its defaults', () => {
    render(
      <PostFxStage depthOfField={{}}>
        <span data-testid="scene" />
      </PostFxStage>
    );

    expect(mocks.depthOfFieldProps?.focusDistance).toBe(0.02);
    expect(mocks.depthOfFieldProps?.focalLength).toBe(0.05);
    expect(mocks.depthOfFieldProps?.bokehScale).toBe(3);
    expect(mocks.bloomProps).toBeNull();
  });

  it('stacks both effects when both are requested', () => {
    render(
      <PostFxStage bloom={{}} depthOfField={{}}>
        <span data-testid="scene" />
      </PostFxStage>
    );

    expect(mocks.bloomProps).not.toBeNull();
    expect(mocks.depthOfFieldProps).not.toBeNull();
  });
});
