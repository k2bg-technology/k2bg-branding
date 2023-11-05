import { format } from 'date-fns';

import { Page } from '../notion/page';

export class Article {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(private page: Page) {}

  get title() {
    return this.page.title?.title.map((title) => title.plain_text).join(' ');
  }

  get excerpt() {
    return this.page.excerpt?.rich_text
      .map((text) => text.plain_text)
      .join(' ');
  }

  get image() {
    return this.page.image?.files
      .flatMap((file) => ('file' in file ? file.file.url : []))
      .join(' ');
  }

  get slug() {
    const slug = this.page.slug?.rich_text
      .map((text) => text.plain_text)
      .join(' ');
    const params = new URLSearchParams({
      id: this.page.id,
    });
    return slug ? `${slug}?${params}` : undefined;
  }

  get status() {
    return this.page.status?.status && 'name' in this.page.status.status
      ? this.page.status.status.name
      : undefined;
  }

  get date() {
    const date =
      this.page.date?.created_time === 'string'
        ? this.page.date.created_time
        : undefined;

    return date ? format(new Date(date), 'yyyy-MM-dd') : '';
  }

  get avatar() {
    if (!Array.isArray(this.page.author?.people))
      return {
        name: '',
        imageUrl: '',
      };

    const people = this.page.author?.people[0] ?? {};

    return {
      name:
        'name' in people && typeof people.name === 'string' ? people.name : '',
      imageUrl:
        'avatar_url' in people && typeof people.avatar_url === 'string'
          ? people.avatar_url
          : '',
    };
  }
}
