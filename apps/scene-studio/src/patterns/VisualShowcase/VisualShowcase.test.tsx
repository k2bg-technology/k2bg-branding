// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { VisualShowcase } from './VisualShowcase';

vi.mock('remotion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('remotion')>();
  return {
    ...actual,
    AbsoluteFill: ({ children }: PropsWithChildren) => <div>{children}</div>,
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

vi.mock('../../primitives', () => ({
  BrandOutro: ({ cta }: { cta?: string }) => (
    <div data-testid="brand-outro">{cta}</div>
  ),
  Caption: ({ text }: { text: string }) => <p data-testid="caption">{text}</p>,
  GradientOverlay: () => <div data-testid="gradient-overlay" />,
  Logo: () => <div data-testid="logo" />,
  MediaFrame: ({
    mediaType,
    src,
    startFromInFrames,
  }: {
    mediaType: string;
    src: string;
    startFromInFrames?: number;
  }) => (
    <div
      data-testid="media-frame"
      data-media-type={mediaType}
      data-src={src}
      data-start-from-in-frames={startFromInFrames}
    />
  ),
  SafeArea: ({ children }: PropsWithChildren) => <div>{children}</div>,
  VideoTitle: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

afterEach(() => {
  cleanup();
});

describe('VisualShowcase', () => {
  it.each([
    { startFromInSeconds: 1.5, expectedSourceFrame: '45' },
    { startFromInSeconds: 1.52, expectedSourceFrame: '46' },
    { startFromInSeconds: undefined, expectedSourceFrame: null },
  ])(
    'passes source start $startFromInSeconds as frame $expectedSourceFrame',
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

      const mediaFrame = screen.getByTestId('media-frame');
      expect(mediaFrame.getAttribute('data-start-from-in-frames')).toBe(
        expectedSourceFrame
      );
    }
  );
});
