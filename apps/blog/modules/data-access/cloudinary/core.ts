import { v2 as cloudinary, DeliveryType, UploadApiOptions } from 'cloudinary';

import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from './const';

const CLOUDINARY_BASE_URI = 'https://res.cloudinary.com';

export class Core {
  constructor() {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
  }

  /** https://cloudinary.com/documentation/transformation_reference#overview */
  static getUrl(options: {
    assetType: 'image' | 'video';
    deliveryType: DeliveryType;
    transformations?: string;
    version?: string;
    publicIdFullPath?: string;
  }) {
    const suffix = [
      options.assetType,
      options.deliveryType,
      options.transformations,
      options.version,
      options.publicIdFullPath,
    ]
      .flatMap((x) => x ?? [])
      .join('/');

    return `${CLOUDINARY_BASE_URI}/${CLOUDINARY_CLOUD_NAME}/${suffix}`;
  }

  // eslint-disable-next-line class-methods-use-this
  protected async upload(file: string, options: UploadApiOptions) {
    return cloudinary.uploader.upload(file, options);
  }
}
