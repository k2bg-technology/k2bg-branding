import { format } from 'date-fns';

import { Page } from '../notion/notionPage';

export class Article {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(private page: Page) {}

  get title() {
    return this.page.getTitle('content');
  }

  get excerpt() {
    return this.page.getRichText('excerpt');
  }

  get image() {
    return this.page.getFiles('image')?.[0];
  }

  get slug() {
    const slug = this.page.getRichText('slug');
    const params = new URLSearchParams({
      id: this.page.id,
    });

    return slug ? `${slug}?${params}` : undefined;
  }

  get status() {
    return this.page.getStatus('status');
  }

  get date() {
    const date = this.page.getCreatedTime('date');

    return date ? format(new Date(date), 'yyyy-MM-dd') : undefined;
  }

  get author() {
    const author = this.page.getPerson('author');

    return author;
  }

  get category() {
    return this.page.getSelect('category');
  }
}
