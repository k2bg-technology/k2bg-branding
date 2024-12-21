import { Page } from '../page';

import { MediaCore } from './interfaces';

export class Core implements MediaCore {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(protected data: Page) {}

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.getTitle('name');
  }

  get type() {
    return this.data.getSelect('type');
  }

  get targetUrl() {
    return this.data.getUrl('targetUrl');
  }

  get sourceUrl() {
    return this.data.getUrl('sourceUrl');
  }

  get sourceFile() {
    return this.data.getFiles('sourceFile')?.[0];
  }

  get width() {
    return this.data.getNumber('width');
  }

  get height() {
    return this.data.getNumber('height');
  }

  protected toObject() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      targetUrl: this.targetUrl,
      sourceUrl: this.sourceUrl,
      sourceFile: this.sourceFile,
      width: this.width,
      height: this.height,
    };
  }
}
