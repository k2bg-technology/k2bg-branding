import { getExtensionFromUrl } from '../../../utility/getExtensionFromUrl';

import { Entity } from './entity';
import type { MediaImage } from './types';

export class Image extends Entity implements MediaImage {
  get extension() {
    return this.sourceUrl ? getExtensionFromUrl(this.sourceUrl) : '';
  }

  toObject() {
    return {
      ...super.toObject(),
      extension: this.extension,
    };
  }
}
