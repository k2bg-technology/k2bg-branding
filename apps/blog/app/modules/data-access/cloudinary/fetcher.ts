import { ConfigAndUrlOptions, TransformationOptions } from 'cloudinary';

import { Core } from './core';

export class Fetcher extends Core {
  public getImageUrl(
    publicId: string,
    options: TransformationOptions & ConfigAndUrlOptions
  ) {
    const { fetch_format, quality } = options;

    const transformations =
      [
        fetch_format ? `q_${fetch_format}` : undefined,
        quality ? `q_${quality}` : undefined,
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
