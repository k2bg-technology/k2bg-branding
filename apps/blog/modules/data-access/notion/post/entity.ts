import { format } from 'date-fns';

import { Page } from '../page';

import { Post } from './types';

export class Entity implements Post {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(private data: Page) {}

  get id() {
    return this.data.id;
  }

  get title() {
    return this.data.getTitle('content');
  }

  get type() {
    return this.data.getSelect('type');
  }

  get excerpt() {
    return this.data.getRichText('excerpt');
  }

  get imageUrl() {
    return this.data.getFiles('imageUrl')?.[0];
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

  get revisionDate() {
    const date = this.data.getDate('revisionDate');

    return date ? format(new Date(date), 'yyyy-MM-dd') : undefined;
  }

  get author() {
    const author = this.data.getPerson('author');

    if (!author) return undefined;

    return {
      id: author.id,
      name: author.name || undefined,
      avatarUrl: author.avatar_url || undefined,
    };
  }

  get category() {
    return this.data.getSelect('category');
  }

  get createdTime() {
    const date = this.data.getCreatedTime('createdTime');

    return date ? format(new Date(date), 'yyyy-MM-dd') : undefined;
  }

  toObject() {
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      excerpt: this.excerpt,
      imageUrl: this.imageUrl,
      slug: this.slug,
      status: this.status,
      category: this.category,
      author: this.author,
      releaseDate: this.releaseDate,
      revisionDate: this.revisionDate,
    };
  }
}
