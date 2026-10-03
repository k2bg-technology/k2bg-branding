// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { VisualShowcase } from './VisualShowcase';

const mocks = vi.hoisted(() => ({ offthreadVideo: vi.fn() }));

vi.mock('remotion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('remotion')>();
  return {
    ...actual,
    AbsoluteFill: ({ children }: PropsWithChildren) => <div>{children}</div>,
    OffthreadVideo: ({
      src,
      startFrom,
    }: {
      src: string;
      startFrom?: number;
    }) => {
      mocks.offthreadVideo({ src, startFrom });
      return null;
    },
    Sequence: ({ children }: PropsWithChildren) => <div>{children}</div>,
    useCurrentFrame: () => 30,
    useVideoConfig: () => ({ fps: 30 }),
  };
});

vi.mock('@remotion/transitions', () => {
  const TransitionSeries = ({ children }: PropsWithChildren) => (
    <div>{children}</div>
  );

  TransitionSeries.Sequence = ({ children }: PropsWithChildren) => (
    <div>{children}</div>
  );
  TransitionSeries.Transition = () => <div data-testid="transition" />;

  return {
    linearTiming: vi.fn(),
    TransitionSeries,
  };
});

vi.mock('@remotion/transitions/fade', () => ({ fade: vi.fn() }));

vi.mock('../../primitives', async () => ({
  MediaFrame: (await import('../../primitives/MediaFrame/MediaFrame'))
    .MediaFrame,
  BrandOutro: ({ cta }: { cta?: string }) => (
    <div data-testid="brand-outro">{cta}</div>
  ),
  Caption: ({ text }: { text: string }) => <p data-testid="caption">{text}</p>,
  GradientOverlay: () => <div data-testid="gradient-overlay" />,
  Logo: () => <div data-testid="logo" />,
  SafeArea: ({ children }: PropsWithChildren) => <div>{children}</div>,
  VideoTitle: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

beforeEach(() => {
  mocks.offthreadVideo.mockClear();
});

afterEach(() => {
  cleanup();
});

describe('VisualShowcase', () => {
  it.each([
    { startFromInSeconds: 1.5, expectedSourceFrame: 45 },
    { startFromInSeconds: 1.52, expectedSourceFrame: 46 },
    { startFromInSeconds: undefined, expectedSourceFrame: undefined },
  ])(
    'starts the video at source frame $expectedSourceFrame for $startFromInSeconds seconds',
    ({ startFromInSeconds, expectedSourceFrame }) => {
      render(
        <VisualShowcase
          title="Quiet Forms"
          items={[
            {
              mediaType: 'video',
              src: 'https://example.com/clip.mp4',
              durationInSeconds: 3,
              startFromInSeconds,
            },
          ]}
        />
      );

      expect(mocks.offthreadVideo).toHaveBeenCalledWith({
        src: 'https://example.com/clip.mp4',
        startFrom: expectedSourceFrame,
      });
    }
  );
});
