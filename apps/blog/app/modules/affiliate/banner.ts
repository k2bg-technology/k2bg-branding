import { Core } from './core';

export class Banner extends Core {
  get imageUrl() {
    const imageUrl = this.page.getUrl('imageUrl');

    if (imageUrl) return imageUrl;

    throw new Error('Banner Affiliate image url is required');
  }

  get imageWidth() {
    const imageWidth = this.page.getNumber('imageWidth');

    if (imageWidth) return imageWidth;

    throw new Error('Banner Affiliate image width is required');
  }

  get imageHeight() {
    const imageHeight = this.page.getNumber('imageHeight');

    if (imageHeight) return imageHeight;

    throw new Error('Banner Affiliate image height is required');
  }
}
