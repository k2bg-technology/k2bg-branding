import { Post } from '../../interfaces/post/validator';

export class PostEntity {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(readonly data: Post) {}

  toObject() {
    return this.data;
  }
}
