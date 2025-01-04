import { Post } from './types';

export class Entity {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(readonly data: Post) {}

  toObject() {
    return this.data;
  }
}
