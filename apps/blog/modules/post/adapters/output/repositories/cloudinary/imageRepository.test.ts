import { describe, expect, it, vi } from 'vitest';
import { ImageUploadError } from '../../../shared';
import { CloudinaryImageRepository } from './imageRepository';

describe('CloudinaryImageRepository', () => {
  const createMockCloudinary = () => ({
    uploader: {
      upload: vi.fn(),
    },
  });

  describe('uploadImage', () => {
    it('uploads image with correct parameters', async () => {
      const mockCloudinary = createMockCloudinary();
      mockCloudinary.uploader.upload.mockResolvedValue({
        secure_url: 'https://res.cloudinary.com/test/image.jpg',
      });
      const sut = new CloudinaryImageRepository(mockCloudinary as never);

      await sut.uploadImage('my-image-id', 'https://example.com/source.jpg');

      expect(mockCloudinary.uploader.upload).toHaveBeenCalledWith(
        'https://example.com/source.jpg',
        {
          public_id: 'my-image-id',
          overwrite: true,
          invalidate: true,
        }
      );
    });

    it('completes successfully on upload success', async () => {
      const mockCloudinary = createMockCloudinary();
      mockCloudinary.uploader.upload.mockResolvedValue({});
      const sut = new CloudinaryImageRepository(mockCloudinary as never);

      await expect(
        sut.uploadImage('image-id', 'https://example.com/image.jpg')
      ).resolves.toBeUndefined();
    });

    it('throws ImageUploadError on upload failure', async () => {
      const mockCloudinary = createMockCloudinary();
      mockCloudinary.uploader.upload.mockRejectedValue(
        new Error('Upload failed')
      );
      const sut = new CloudinaryImageRepository(mockCloudinary as never);

      await expect(
        sut.uploadImage('image-id', 'https://example.com/image.jpg')
      ).rejects.toThrow(ImageUploadError);
    });

    it('includes image id in error message', async () => {
      const mockCloudinary = createMockCloudinary();
      mockCloudinary.uploader.upload.mockRejectedValue(
        new Error('Upload failed')
      );
      const sut = new CloudinaryImageRepository(mockCloudinary as never);

      await expect(
        sut.uploadImage('my-special-image', 'https://example.com/image.jpg')
      ).rejects.toThrow('my-special-image');
    });
  });
});
