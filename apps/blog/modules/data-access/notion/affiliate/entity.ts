import type { Page } from '../page';

import type { Affiliate } from './types';

export class Entity implements Affiliate {
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

  get provider() {
    return this.data.getSelect('provider');
  }

  protected toObject() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      targetUrl: this.targetUrl,
      provider: this.provider,
    };
  }
}
