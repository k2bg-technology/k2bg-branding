import { Core } from './core';

export class Product extends Core {
  get subProviders() {
    const subProviders = this.page.getRelations('subProviders');

    return subProviders;
  }

  get imageProvider() {
    const imageProvider = this.page.getSelect('imageProvider');

    if (imageProvider) return imageProvider;

    throw new Error('Product Affiliate image provider is required');
  }

  get imageFile() {
    const imageFile = this.page.getFiles('imageFile')?.[0];

    if (imageFile) return imageFile;

    throw new Error('Product Affiliate image file is required');
  }

  get imageWidth() {
    const imageWidth = this.page.getNumber('imageWidth');

    if (imageWidth) return imageWidth;

    throw new Error('Product Affiliate image width is required');
  }

  get imageHeight() {
    const imageHeight = this.page.getNumber('imageHeight');

    if (imageHeight) return imageHeight;

    throw new Error('Product Affiliate image height is required');
  }
}
