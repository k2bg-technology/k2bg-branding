import { render, screen } from '@testing-library/react';
import { cacheLife } from 'next/cache';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CloudinaryImage } from './CloudinaryImage';

vi.mock('next/cache', () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // biome-ignore lint/performance/noImgElement: The test inspects the accessible output of Next Image.
    <img alt={alt} src={src} />
  ),
}));
vi.mock('../../infrastructure/cloudinary', () => ({
  getOptimizedImageUrl: () => 'https://res.cloudinary.com/fixture/image.webp',
  getPlaceholderImageUrl: () =>
    'https://res.cloudinary.com/fixture/placeholder.webp',
}));

describe('CloudinaryImage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('renders the optimized image with its accessible name after loading the placeholder', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ arrayBuffer: async () => new ArrayBuffer(4) })
    );

    render(
      await CloudinaryImage({
        publicId: 'image',
        src: 'https://example.com/original.jpg',
        alt: 'Article illustration',
        width: 100,
        height: 100,
      })
    );

    expect(
      screen.getByRole('img', { name: 'Article illustration' })
    ).toHaveAttribute('src', 'https://res.cloudinary.com/fixture/image.webp');
  });

  it('renders a fallback without an image when loading the placeholder fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Image service unavailable'))
    );

    const { container } = render(
      await CloudinaryImage({
        publicId: 'image',
        src: 'https://example.com/original.jpg',
        alt: 'Article illustration',
        width: 100,
        height: 100,
      })
    );

    expect(
      screen.queryByRole('img', { name: 'Article illustration' })
    ).not.toBeInTheDocument();
    expect(container).not.toBeEmptyDOMElement();
  });

  it('uses a short cache lifetime and never hours when the dependency fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Source unavailable'))
    );
    const sut = CloudinaryImage;

    await sut({
      publicId: 'image',
      src: 'https://example.com/image.jpg',
      alt: 'Image',
      width: 100,
      height: 100,
    });

    expect(cacheLife).toHaveBeenCalledWith(
      expect.objectContaining({ revalidate: 60, expire: 300 })
    );
    expect(cacheLife).not.toHaveBeenCalledWith('hours');
  });

  it('uses hours when the dependency succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ arrayBuffer: async () => new ArrayBuffer(4) })
    );
    const sut = CloudinaryImage;

    await sut({
      publicId: 'image',
      src: 'https://example.com/image.jpg',
      alt: 'Image',
      width: 100,
      height: 100,
    });

    expect(cacheLife).toHaveBeenCalledWith('hours');
  });
});
