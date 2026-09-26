import { afterEach, describe, expect, it, vi } from 'vitest';
import { CloudinaryOgImageUrlGenerator } from './getOgImageUrl';

describe('CloudinaryOgImageUrlGenerator', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns a Cloudinary URL with OG-optimized transformations', () => {
    vi.stubEnv('CLOUDINARY_CLOUD_NAME', 'test-cloud');
    const sut = new CloudinaryOgImageUrlGenerator();
    const publicId = 'blog/sample-image';

    const result = sut.generate(publicId);

    const expectedUrl =
      'https://res.cloudinary.com/test-cloud/image/upload/c_fill,w_1200,h_630,f_jpg,q_auto/blog/sample-image';
    expect(result).toBe(expectedUrl);
  });
});
