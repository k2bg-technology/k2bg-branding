import {
  v2 as cloudinary,
  ConfigAndUrlOptions,
  DeliveryType,
  TransformationOptions,
  UploadApiOptions,
} from 'cloudinary';

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
  // eslint-disable-next-line class-methods-use-this
  private getUrl(options: {
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
  protected getImageUrl(
    publicId: string,
    options: TransformationOptions & ConfigAndUrlOptions
  ) {
    const { fetch_format, quality, effect, width, version } = options;

    const transformations =
      [
        fetch_format ? `f_${fetch_format}` : undefined,
        quality ? `q_${quality}` : undefined,
        effect ? `e_${effect}` : undefined,
        width ? `w_${width}` : undefined,
      ]
        .flatMap((x) => x ?? [])
        .join(',') || undefined;

    return this.getUrl({
      assetType: 'image',
      deliveryType: 'upload',
      transformations,
      publicIdFullPath: publicId,
      ...(version && { version: `v${version}` }),
    });
  }

  // eslint-disable-next-line class-methods-use-this
  protected async fetchVersion(publicId: string): Promise<string> {
    const { version } = await cloudinary.api.resource(publicId);

    return version;
  }

  // eslint-disable-next-line class-methods-use-this
  protected async upload(file: string, options: UploadApiOptions) {
    cloudinary.uploader.upload(file, options);
  }
}
