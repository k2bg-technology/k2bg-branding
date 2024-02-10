import { Page } from '../notion/notionPage';

export class Core {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(protected page: Page) {}

  get name() {
    const name = this.page.getTitle('name');

    if (name) return name;

    throw new Error('Affiliate name is required');
  }

  get type() {
    const type = this.page.getSelect('type');

    if (type) return type;

    throw new Error('Affiliate type is required');
  }

  get linkText() {
    const linkText = this.page.getRichText('linkText');

    if (linkText) return linkText;

    throw new Error('Affiliate link text is required');
  }

  get linkUrl() {
    const linkUrl = this.page.getUrl('linkUrl');

    if (linkUrl) return linkUrl;

    throw new Error('Affiliate link url is required');
  }

  get provider() {
    const provider = this.page.getSelect('provider');

    if (provider) return provider;

    throw new Error('Affiliate provider is required');
  }

  static getType(page: Page) {
    return page.getSelect('type');
  }
}
