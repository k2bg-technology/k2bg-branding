import { Core } from './core';
import { AffiliateBanner } from './interfaces';

export class Banner extends Core implements AffiliateBanner {
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
