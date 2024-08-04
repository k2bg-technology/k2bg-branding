import { AffiliateCore, AffiliateData } from './interfaces';

export class Core implements AffiliateCore {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(protected data: AffiliateData) {}

  get id() {
    return this.data.id;
  }

  get name() {
    const name = this.data.getTitle('name');

    if (name) return name;

    throw new Error('Affiliate name is required');
  }

  get type() {
    const type = this.data.getSelect('type');

    if (type) return type;

    throw new Error('Affiliate type is required');
  }

  get linkText() {
    const linkText = this.data.getRichText('linkText');

    if (linkText) return linkText;

    throw new Error('Affiliate link text is required');
  }

  get linkUrl() {
    const linkUrl = this.data.getUrl('linkUrl');

    if (linkUrl) return linkUrl;

    throw new Error('Affiliate link url is required');
  }

  get provider() {
    const provider = this.data.getSelect('provider');

    if (provider) return provider;

    throw new Error('Affiliate provider is required');
  }
}
