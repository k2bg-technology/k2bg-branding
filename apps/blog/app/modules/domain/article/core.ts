import { format } from 'date-fns';

import { ArticleCore, ArticleData } from './interfaces';
import { getImageWithPlaceholder } from '../../utility/getImageWithPlaceholder';

export class Core implements ArticleCore {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(private data: ArticleData) {}

  get id() {
    return this.data.id;
  }

  get title() {
    return this.data.getTitle('content');
  }

  get excerpt() {
    return this.data.getRichText('excerpt');
  }

  get image() {
    return this.data.getFiles('image')?.[0];
  }

  get imagePlaceholder() {
    return getImageWithPlaceholder(this.image || '');
  }

  get slug() {
    const slug = this.data.getRichText('slug');

    return slug ? `${this.data.id}/${slug}` : undefined;
  }

  get status() {
    return this.data.getStatus('status');
  }

  get releaseDate() {
    const date = this.data.getDate('releaseDate');

    return date ? format(new Date(date), 'yyyy-MM-dd') : undefined;
  }

  get author() {
    const author = this.data.getPerson('author');

    return author;
  }

  get category() {
    return this.data.getSelect('category');
  }

  get createdTime() {
    const date = this.data.getCreatedTime('createdTime');

    return date ? format(new Date(date), 'yyyy-MM-dd') : undefined;
  }
}
