// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MediaFrame } from './MediaFrame';

vi.mock('remotion', () => ({
  AbsoluteFill: ({
    children,
    className,
  }: PropsWithChildren<{ className?: string }>) => (
    <div className={className}>{children}</div>
  ),
  Img: ({ src }: { src: string }) => (
    <img data-testid="image" src={src} alt="media frame content" />
  ),
  OffthreadVideo: ({
    src,
    startFrom,
    muted,
  }: {
    src: string;
    startFrom?: number;
    muted?: boolean;
  }) => (
    <video
      muted
      data-testid="video"
      data-src={src}
      data-start-from={startFrom}
      data-muted={String(muted)}
    />
  ),
  staticFile: (path: string) => `/public/${path}`,
}));

afterEach(() => {
  cleanup();
});

describe('MediaFrame', () => {
  it('resolves relative image sources through staticFile', () => {
    render(<MediaFrame src="assets/photo.jpg" mediaType="image" />);

    const image = screen.getByTestId('image');

    expect(image.getAttribute('src')).toBe('/public/assets/photo.jpg');
  });

  it('passes remote image URLs through untouched', () => {
    const remoteSource = 'https://example.com/photo.jpg';

    render(<MediaFrame src={remoteSource} mediaType="image" />);

    const image = screen.getByTestId('image');

    expect(image.getAttribute('src')).toBe(remoteSource);
  });

  it('renders a video element instead of an image for video sources', () => {
    render(<MediaFrame src="assets/clip.mp4" mediaType="video" />);

    expect(screen.getByTestId('video')).toBeDefined();
    expect(screen.queryByTestId('image')).toBeNull();
  });

  it('resolves relative video sources and forwards trim and mute settings', () => {
    render(
      <MediaFrame
        src="assets/clip.mp4"
        mediaType="video"
        startFromInFrames={45}
      />
    );

    const video = screen.getByTestId('video');

    expect(video.getAttribute('data-src')).toBe('/public/assets/clip.mp4');
    expect(video.getAttribute('data-start-from')).toBe('45');
    expect(video.getAttribute('data-muted')).toBe('true');
  });
});
