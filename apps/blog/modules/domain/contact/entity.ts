import type { Contact } from './types';

export class Entity {
  constructor(readonly data: Contact) {}

  toObject() {
    return this.data;
  }
}
