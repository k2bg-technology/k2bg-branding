import { UploadApiOptions } from 'cloudinary';

import { Core } from './core';

export class Uploader extends Core {
  public async uploadImage(file: string, options: UploadApiOptions) {
    return this.upload(file, options);
  }
}
