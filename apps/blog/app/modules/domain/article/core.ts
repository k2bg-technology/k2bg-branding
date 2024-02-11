import { format } from 'date-fns';

import { ArticleCore, ArticleData } from './interfaces';

export class Core implements ArticleCore {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(private data: ArticleData) {}

  get title() {
    return this.data.getTitle('content');
  }

  get excerpt() {
    return this.data.getRichText('excerpt');
  }

  get image() {
    return this.data.getFiles('image')?.[0];
  }

  get slug() {
    const slug = this.data.getRichText('slug');
    const params = new URLSearchParams({
      id: this.data.id,
    });

    return slug ? `${slug}?${params}` : undefined;
  }

  get status() {
    return this.data.getStatus('status');
  }

  get date() {
    const date = this.data.getCreatedTime('date');

    return date ? format(new Date(date), 'yyyy-MM-dd') : undefined;
  }

  get author() {
    const author = this.data.getPerson('author');

    return author;
  }

  get category() {
    return this.data.getSelect('category');
  }
}
