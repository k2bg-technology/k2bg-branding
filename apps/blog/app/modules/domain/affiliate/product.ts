import { getImageWithPlaceholder } from '../../utility/getImageWithPlaceholder';
import { Core } from './core';
import { AffiliateProduction } from './interfaces';

export class Product extends Core implements AffiliateProduction {
  get providerColor() {
    const providerColor = this.data.getSelect('providerColor');

    if (providerColor) return providerColor;

    throw new Error('Affiliate providerColor is required');
  }

  get subProviders() {
    const subProviders = this.data.getRelations('subProviders');

    return subProviders;
  }

  get imageProvider() {
    const imageProvider = this.data.getSelect('imageProvider');

    if (imageProvider) return imageProvider;

    throw new Error('Product Affiliate image provider is required');
  }

  get imageFile() {
    const imageFile = this.data.getFiles('imageFile')?.[0];

    if (imageFile) return imageFile;

    throw new Error('Product Affiliate image file is required');
  }

  get imagePlaceholder() {
    return getImageWithPlaceholder(this.imageFile || '');
  }

  get imageWidth() {
    const imageWidth = this.data.getNumber('imageWidth');

    if (imageWidth) return imageWidth;

    throw new Error('Product Affiliate image width is required');
  }

  get imageHeight() {
    const imageHeight = this.data.getNumber('imageHeight');

    if (imageHeight) return imageHeight;

    throw new Error('Product Affiliate image height is required');
  }
}
