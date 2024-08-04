import { getImageWithPlaceholder } from '../../utility/getImageWithPlaceholder';
import { Core } from './core';
import { AffiliateBanner } from './interfaces';

export class Banner extends Core implements AffiliateBanner {
  get imageUrl() {
    const imageUrl = this.data.getUrl('imageUrl');

    if (imageUrl) return imageUrl;

    throw new Error('Banner Affiliate image url is required');
  }

  get imagePlaceholder() {
    return getImageWithPlaceholder(this.imageUrl || '');
  }

  get imageWidth() {
    const imageWidth = this.data.getNumber('imageWidth');

    if (imageWidth) return imageWidth;

    throw new Error('Banner Affiliate image width is required');
  }

  get imageHeight() {
    const imageHeight = this.data.getNumber('imageHeight');

    if (imageHeight) return imageHeight;

    throw new Error('Banner Affiliate image height is required');
  }

  getOptimizedUrl(
    optimizeFunction: (id: string, url: string) => Promise<string> | string
  ) {
    return optimizeFunction(this.id, this.imageUrl);
  }
}
