import { Page } from '../page';

import { MediaCore } from './interfaces';

export class Core implements MediaCore {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(protected data: Page) {}

  get id() {
    return this.data.id;
  }

  get name() {
    const name = this.data.getTitle('name');

    if (name) return name;

    throw new Error('name is required');
  }

  get type() {
    const type = this.data.getSelect('type');

    if (type) return type;

    throw new Error('type is required');
  }

  get linkText() {
    const linkText = this.data.getRichText('linkText');

    return linkText;
  }

  get linkUrl() {
    const linkUrl = this.data.getUrl('linkUrl');

    return linkUrl;
  }

  get url() {
    const provider = this.data.getUrl('url');

    return provider;
  }

  get file() {
    const file = this.data.getFiles('file')?.[0];

    return file;
  }

  get width() {
    const width = this.data.getNumber('width');

    if (width) return width;

    throw new Error('width is required');
  }

  get height() {
    const imageHeight = this.data.getNumber('height');

    if (imageHeight) return imageHeight;

    throw new Error('height is required');
  }
}
