import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { getOptimizedImageUrl } from './getOptimizedImageUrl';
import { resetCloudinaryConfig } from './client';

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
  },
}));

describe('getOptimizedImageUrl', () => {
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

  it('returns URL with auto format and quality', () => {
    const publicId = 'sample-image';

    const url = getOptimizedImageUrl(publicId);

    expect(url).toContain('test-cloud');
    expect(url).toContain('f_auto');
    expect(url).toContain('q_auto');
    expect(url).toContain('sample-image');
  });
});
