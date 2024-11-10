import { getExtensionFromUrl } from '../../utility/getExtensionFromUrl';
import { getImageWithPlaceholder } from '../../utility/getImageWithPlaceholder';
import { Core } from './core';
import { MediaImage } from './interfaces';

export class Image extends Core implements MediaImage {
  get placeholder() {
    return getImageWithPlaceholder(this.file || this.url || '');
  }

  get extension() {
    return getExtensionFromUrl(this.file || this.url || '');
  }

  getOptimizedUrl(
    optimizeFunction: (id: string, file: string) => Promise<string> | string
  ) {
    if (!this.file) return;

    return optimizeFunction(this.id, this.file);
  }
}
