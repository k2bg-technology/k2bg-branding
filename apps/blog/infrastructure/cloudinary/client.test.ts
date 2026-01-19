import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  buildImageUrl,
  configureCloudinary,
  getCloudinary,
  resetCloudinaryConfig,
} from './client';

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn().mockResolvedValue({ secure_url: 'https://example.com/image.jpg' }),
    },
    api: {
      resource: vi.fn().mockResolvedValue({ version: '12345' }),
    },
  },
}));

describe('cloudinary/client', () => {
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

  describe('configureCloudinary', () => {
    it('configures cloudinary with environment variables', () => {
      const cloudinary = getCloudinary();

      expect(cloudinary.config).toHaveBeenCalled();
    });

    it('accepts custom configuration', () => {
      configureCloudinary({
        cloudName: 'custom-cloud',
        apiKey: 'custom-key',
        apiSecret: 'custom-secret',
      });

      const cloudinary = getCloudinary();

      expect(cloudinary).toBeDefined();
    });
  });

  describe('getCloudinary', () => {
    it('returns the cloudinary instance', () => {
      const cloudinary = getCloudinary();

      expect(cloudinary).toBeDefined();
    });

    it('auto-configures on first call', () => {
      const cloudinary = getCloudinary();

      expect(cloudinary.config).toHaveBeenCalled();
    });
  });

  describe('buildImageUrl', () => {
    it('builds a basic image URL', () => {
      const url = buildImageUrl('my-image');

      expect(url).toContain('test-cloud');
      expect(url).toContain('my-image');
    });

    it('includes format transformation', () => {
      const url = buildImageUrl('my-image', { format: 'auto' });

      expect(url).toContain('f_auto');
    });

    it('includes quality transformation', () => {
      const url = buildImageUrl('my-image', { quality: 'auto' });

      expect(url).toContain('q_auto');
    });

    it('includes width transformation', () => {
      const url = buildImageUrl('my-image', { width: 800 });

      expect(url).toContain('w_800');
    });

    it('includes effect transformation', () => {
      const url = buildImageUrl('my-image', { effect: 'blur:1000' });

      expect(url).toContain('e_blur:1000');
    });

    it('combines multiple transformations', () => {
      const url = buildImageUrl('my-image', {
        format: 'auto',
        quality: 'auto',
        width: 800,
      });

      expect(url).toContain('f_auto');
      expect(url).toContain('q_auto');
      expect(url).toContain('w_800');
    });
  });
});
