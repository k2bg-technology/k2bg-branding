import { Entity } from './entity';
import { AffiliateBanner } from './types';

export class Banner extends Entity implements AffiliateBanner {
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
      imageSourceUrl: this.imageSourceUrl,
      imageWidth: this.imageWidth,
      imageHeight: this.imageHeight,
    };
  }
}
