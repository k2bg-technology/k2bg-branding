import { getImageWithPlaceholder } from '../../utility/getImageWithPlaceholder';
import { Core } from './core';
import { MediaImage } from './interfaces';

export class Image extends Core implements MediaImage {
  get placeholder() {
    return getImageWithPlaceholder(this.file || this.url || '');
  }
}
