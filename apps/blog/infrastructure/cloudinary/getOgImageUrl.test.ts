import { afterEach, describe, it, expect, vi } from 'vitest';
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

  it('includes the cloud name from environment variable', () => {
    vi.stubEnv('CLOUDINARY_CLOUD_NAME', 'my-cloud');
    const sut = new CloudinaryOgImageUrlGenerator();

    const result = sut.generate('image-id');

    expect(result).toContain('res.cloudinary.com/my-cloud');
  });

  it('preserves the full public ID path', () => {
    vi.stubEnv('CLOUDINARY_CLOUD_NAME', 'test-cloud');
    const sut = new CloudinaryOgImageUrlGenerator();
    const publicId = 'folder/subfolder/image-name';

    const result = sut.generate(publicId);

    expect(result.endsWith(publicId)).toBe(true);
  });
});
