import { getExtensionFromUrl } from '../../../utility/getExtensionFromUrl';

import { Core } from './core';
import { MediaImage } from './interfaces';

export class Image extends Core implements MediaImage {
  get extension() {
    return getExtensionFromUrl(this.file || this.url || '');
  }
}
