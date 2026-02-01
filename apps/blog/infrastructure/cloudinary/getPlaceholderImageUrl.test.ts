import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { getPlaceholderImageUrl } from './getPlaceholderImageUrl';
import { resetCloudinaryConfig } from './client';

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
  },
}));

describe('getPlaceholderImageUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    resetCloudinaryConfig();
    process.env = {
      ...originalEnv,
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
    };
  });

  afterEach(() => {
    resetCloudinaryConfig();
    process.env = originalEnv;
  });

  describe('without options', () => {
    it('returns URL with blur effect and small width', () => {
      const publicId = 'sample-image';

      const url = getPlaceholderImageUrl(publicId);

      expect(url).toContain('test-cloud');
      expect(url).toContain('f_auto');
      expect(url).toContain('q_auto');
      expect(url).toContain('e_blur:1000');
      expect(url).toContain('w_100');
      expect(url).toContain('sample-image');
    });
  });

  describe('with version option', () => {
    it('includes version in URL', () => {
      const publicId = 'sample-image';
      const version = '67890';

      const url = getPlaceholderImageUrl(publicId, { version });

      expect(url).toContain('v67890');
      expect(url).toContain('e_blur:1000');
      expect(url).toContain('sample-image');
    });
  });
});
