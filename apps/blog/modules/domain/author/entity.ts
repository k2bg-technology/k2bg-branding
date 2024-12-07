import { Author } from './types';

export class AuthorEntity {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(readonly data: Author) {}

  toObject() {
    return this.data;
  }
}
