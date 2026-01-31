import type { Contact as ContactType } from '../types';

export class Contact {
  constructor(readonly data: ContactType) {}

  toObject() {
    return this.data;
  }
}
