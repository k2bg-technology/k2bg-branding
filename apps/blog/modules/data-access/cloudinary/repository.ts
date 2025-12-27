import * as Domain from '../../domain';

import { Core } from './core';

export class Repository extends Core implements Domain.Image.Repository {
  getOptimizedImageUrl(id: string, version?: string) {
    return this.getImageUrl(id, {
      fetch_format: 'auto',
      quality: 'auto',
      version,
    });
  }

  getPlaceholderImageUrl(id: string, version?: string) {
    return this.getImageUrl(id, {
      fetch_format: 'auto',
      quality: 'auto',
      effect: 'blur:1000',
      width: '100',
      version,
    });
  }

  async fetchImageVersion(publicId: string) {
    return this.fetchVersion(publicId);
  }

  async uploadImage(id: string, fileUrl: string) {
    return this.upload(fileUrl, {
      public_id: id,
      overwrite: true,
      invalidate: true,
    });
  }
}
