import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fetchImageVersion } from './fetchImageVersion';
import { resetCloudinaryConfig } from './client';

const mockResource = vi.fn();

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    api: {
      resource: (...args: unknown[]) => mockResource(...args),
    },
  },
}));

describe('fetchImageVersion', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    resetCloudinaryConfig();
    mockResource.mockReset();
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

  it('returns version as string from Cloudinary API', async () => {
    const publicId = 'sample-image';
    const expectedVersion = 1234567890;
    mockResource.mockResolvedValue({ version: expectedVersion });

    const version = await fetchImageVersion(publicId);

    expect(version).toBe('1234567890');
  });

  it('calls getResource with correct publicId', async () => {
    const publicId = 'folder/nested-image';
    mockResource.mockResolvedValue({ version: 1 });

    await fetchImageVersion(publicId);

    expect(mockResource).toHaveBeenCalledWith(publicId);
  });
});
