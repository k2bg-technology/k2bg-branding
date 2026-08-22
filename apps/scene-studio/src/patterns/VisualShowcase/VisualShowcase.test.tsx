// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { VisualShowcase } from './VisualShowcase';

vi.mock('remotion', () => ({
  AbsoluteFill: ({ children }: PropsWithChildren) => <div>{children}</div>,
  interpolate: (
    input: number,
    [inputStart, inputEnd]: [number, number],
    [outputStart, outputEnd]: [number, number]
  ) =>
    outputStart +
    ((Math.min(Math.max(input, inputStart), inputEnd) - inputStart) /
      (inputEnd - inputStart)) *
      (outputEnd - outputStart),
  Sequence: ({ children }: PropsWithChildren) => <div>{children}</div>,
  useCurrentFrame: () => 30,
  useVideoConfig: () => ({ fps: 30 }),
}));

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
  it('renders the supplied media, caption, title, subtitle, and outro call to action', () => {
    render(
      <VisualShowcase
        title="Quiet Forms"
        subtitle="A visual study"
        cta="Explore more work"
        items={[
          {
            mediaType: 'image',
            src: 'https://example.com/first.jpg',
            durationInSeconds: 4,
            caption: 'Morning light',
          },
          {
            mediaType: 'video',
            src: 'https://example.com/second.mp4',
            durationInSeconds: 3,
            startFromInSeconds: 1.5,
          },
        ]}
      />
    );

    const mediaFrames = screen.getAllByTestId('media-frame');

    expect(screen.getByRole('heading', { name: 'Quiet Forms' })).toBeDefined();
    expect(screen.getByText('A visual study')).toBeDefined();
    expect(screen.getByText('Morning light')).toBeDefined();
    expect(screen.getByTestId('gradient-overlay')).toBeDefined();
    expect(screen.getByTestId('brand-outro').textContent).toBe(
      'Explore more work'
    );
    expect(screen.getByTestId('logo')).toBeDefined();
    expect(mediaFrames).toHaveLength(2);
    expect(mediaFrames[0]?.getAttribute('data-src')).toBe(
      'https://example.com/first.jpg'
    );
    expect(mediaFrames[1]?.getAttribute('data-media-type')).toBe('video');
    expect(mediaFrames[1]?.getAttribute('data-start-from-in-frames')).toBe(
      '45'
    );
    expect(screen.getAllByTestId('transition')).toHaveLength(2);
  });

  it('omits optional text and caption treatment when no optional props are supplied', () => {
    render(
      <VisualShowcase
        title="Quiet Forms"
        items={[
          {
            mediaType: 'image',
            src: 'https://example.com/first.jpg',
            durationInSeconds: 4,
          },
        ]}
      />
    );

    expect(screen.getByRole('heading', { name: 'Quiet Forms' })).toBeDefined();
    expect(screen.queryByTestId('caption')).toBeNull();
    expect(screen.queryByTestId('gradient-overlay')).toBeNull();
    expect(screen.getByTestId('brand-outro').childElementCount).toBe(0);
    expect(screen.getByTestId('brand-outro').textContent).toBe('');
    expect(screen.getAllByTestId('transition')).toHaveLength(1);
  });
});
