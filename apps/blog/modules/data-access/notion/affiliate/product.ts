import { Entity } from './entity';
import type { AffiliateProduction } from './types';

export class Product extends Entity implements AffiliateProduction {
  get providerColor() {
    return this.data.getSelect('providerColor');
  }

  get subProviders() {
    return this.data.getRelations('subProviders');
  }

  get imageProvider() {
    return this.data.getSelect('imageProvider');
  }

  get imageSourceUrl() {
    return (
      this.data.getFiles('imageSourceFile')?.[0] ||
      this.data.getUrl('imageSourceUrl')
    );
  }

  get imageWidth() {
    return this.data.getNumber('imageWidth');
  }

  get imageHeight() {
    return this.data.getNumber('imageHeight');
  }

  toObject() {
    return {
      ...super.toObject(),
      providerColor: this.providerColor,
      subProviders: this.subProviders,
      imageProvider: this.imageProvider,
      imageSourceUrl: this.imageSourceUrl,
      imageWidth: this.imageWidth,
      imageHeight: this.imageHeight,
    };
  }
}
