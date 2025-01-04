import { Author } from './types';

export class Entity {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(readonly data: Author) {}

  toObject() {
    return this.data;
  }
}
