import { ConfigAndUrlOptions, TransformationOptions } from 'cloudinary';

import { Core } from './core';

export class Fetcher extends Core {
  static getImageUrl(
    publicId: string,
    options: TransformationOptions & ConfigAndUrlOptions
  ) {
    const { fetch_format, quality, effect, width } = options;

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
    });
  }
}
