import { Contact } from './types';

export class Entity {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(readonly data: Contact) {}

  toObject() {
    return this.data;
  }
}
